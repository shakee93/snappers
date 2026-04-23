# WordPress Backend Performance Findings

Context: WP runs inside Docker on `37.60.235.46` (container `wordpress-xko4k0w4ks0sw84kw8o0sksg`). Under load the container has hit **1246% CPU** (12+ cores) with load averages spiking to 110. MySQL peaks at 208%. The Next.js frontend (Vercel) is a heavy `/graphql` client, and the Apr 20 BOGO deploy stepped baseline load from ~3 → 8–19.

---

## Critical — GraphQL HTTP cache is disabled

**`wpgraphql-smart-cache` is active but `cache_toggle: "off"`** (confirmed via `wp option get graphql_cache_section`). Every GraphQL request currently runs the full resolver pipeline with no HTTP-level dedup.

**Why it's off:** enabling globally previously cached cart / account / checkout / session-bearing responses — not safe.

**Correct fix (keep carts/accounts safe):**
WPGraphQL Smart Cache supports *selective* caching rather than all-or-nothing. Use one of:

1. **Cache only persisted-query operations by name.** Register persisted query IDs for catalog reads (`GET_PRODUCT`, `GET_PRODUCTS_NODES`, `GET_PRODUCTS_BY_BOGO_TAG`, `GET_BRAND_ARCHIVE`, `GET_CATEGORY_ARCHIVE`, `GET_BRANDS`, `GET_OPTIONS`, `GET_TAG_DETAILS_BY_SLUG`, etc.) and bind TTLs per query. Cart/checkout/customer queries never get persisted IDs, so they bypass cache.
2. **Bypass at request level for logged-in or session-bearing requests.** WPGraphQL Smart Cache automatically skips caching when the request has a logged-in user; ensure cart queries from the Next.js SSR path are sent with a session token header so they're treated as session-bearing. Anonymous catalog queries then get cached.
3. **Move the cache to Traefik** and write rules: cache `POST /graphql` for 300s *only* when the request body hashes to one of the allow-listed catalog operation signatures, and cookie/auth-header is absent. Keeps WPGraphQL stock.

Either approach gives the biggest single win available on the WP side — enabling response caching on catalog queries only. Do **not** flip the global toggle back on without query-level rules.

---

## Custom BOGO plugin (`wc-bogo-simple/wc-bogo-simple.php`, v2.0.1, 811 lines)

Hooks reviewed: `woocommerce_before_calculate_totals@20`, `woocommerce_cart_item_name`, product/variation save hooks, GraphQL-tag sync.

### 1. No dedicated GraphQL field — biggest structural issue

Plugin only stores raw `_wc_bogo_*` postmeta. Frontend reads them via `metaData(keysIn:[6 keys])` attached to `ProductContentFull`, so **every product in every listing does 6 postmeta lookups** just to decide "is BOGO?".

**Fix in plugin:**
```php
// In init():
add_action('graphql_register_types', array($this, 'register_graphql_types'));

public function register_graphql_types() {
    register_graphql_object_type('BogoConfig', array(
        'fields' => array(
            'enabled'         => array('type' => 'Boolean'),
            'buyQty'          => array('type' => 'Int'),
            'getQty'          => array('type' => 'Int'),
            'maxFreeQty'      => array('type' => 'Int'),
            'freeProductIds'  => array('type' => array('list_of' => 'Int')),
            'label'           => array('type' => 'String'),
        ),
    ));
    register_graphql_field('Product', 'bogo', array(
        'type'    => 'BogoConfig',
        'resolve' => function ($product) {
            $id = is_object($product) ? $product->ID : 0;
            $data = $this->get_bogo_rule_data($id, 0, wc_get_product($id));
            return array(
                'enabled'        => (bool) $data['enabled'],
                'buyQty'         => (int) $data['buy_qty'],
                'getQty'         => (int) $data['get_qty'],
                'maxFreeQty'     => (int) $data['max_free_qty'],
                'freeProductIds' => array_map('intval', $data['free_product_ids']),
                'label'          => sprintf('Buy %d Get %d Free', $data['buy_qty'], $data['get_qty']),
            );
        },
    ));
}
```
Frontend then queries one cheap typed field, `bogoPluginMeta` can be deleted from `ProductContentFull`, and per-row cost drops dramatically. The existing per-request memoization (`$rule_data_cache`) carries over.

### 2. `sync_free_products()` runs on every cart-calc

`woocommerce_before_calculate_totals` fires for every GraphQL cart query (WooGraphQL's cart resolver calls `calculate_totals()`), every checkout view, every mini-cart load. Each invocation:
- Loops all cart items (`wc-bogo-simple.php:373`)
- Calls `wc_get_product()` per configured free product ID (line 442) — DB hit each
- Mutates the cart via `add_to_cart` / `remove_cart_item` / `set_quantity` — these can re-trigger downstream hooks (the `$is_processing` static guards against re-entrance, good)

The reentrance guard and `$last_reconcile_fingerprint` are **static-per-PHP-request**. They help only within a single request. Cross-request, every identical cart re-runs the full reconcile.

**Fix:** cache the (cart-contents-hash → reconcile decision) in WP transients / Redis keyed by the cart session. Skip reconcile entirely when the hash matches a recent one. The existing fingerprint function (line 526) already computes the right hash.

### 3. Duplicate legacy meta read

`get_configured_free_product_ids()` (line 676) reads `_wc_bogo_free_product_ids`, then unconditionally also checks `_wc_bogo_free_product_id`. Short-circuit if the first returns non-empty.

### 4. `wc_get_product()` inside tight loop

Line 442 — `wc_get_product($free_product_id)` per free ID per paid cart item. For carts with BOGO products referencing multiple free variations, this is O(paid × free). Preload with a single `WC_Product_Data_Store_CPT::get_products()` by IDs instead.

### 5. `sync_bogo_catalog_product_tag()` on every product save — OK

Acceptable. Admin-only path.

---

## Plugin bloat — active on every `/graphql` request

Every active plugin runs its `plugins_loaded` / `init` hooks in the hot path. These do nothing useful on a headless WP where the frontend is Next.js:

| Plugin | Why unused on headless | Action |
|---|---|---|
| `jetpack` | Tracking/sync/dashboard pings. Heaviest single plugin. | Deactivate |
| `all-in-one-seo-pack` | Injects meta into WP HTML. Next.js generates metadata. | Deactivate |
| `google-analytics-for-wordpress` (MonsterInsights) | GA tag in WP HTML. Next.js has its own GA. | Deactivate |
| `google-site-kit` | Google API integration, background jobs. | Deactivate |
| `hotjar` | Injects tracking into WP HTML. | Deactivate |
| `optinmonster` | Popups on WP frontend. | Deactivate |
| `userfeedback-lite` | Frontend widget. | Deactivate |
| `wpconsent-cookies-banner-privacy-suite` | GDPR banner on WP HTML. | Deactivate |
| `unusedcss` (RapidLoad) | Rewrites unused CSS from WP HTML output. | Deactivate |
| `all-in-one-wp-migration` + `migrate-guru` | **Two** migration plugins both active. | Keep one, deactivate the other |
| `waitlist-woocommerce` + `waitlist-woocommerce-extend` | Two waitlist plugins both active. | Verify; likely one redundant |
| `wordfence` (inactive) + `gotmls` (active) | Two security plugins installed. | Keep one, uninstall the other |
| `woocommerce-email-template-customizer` | Admin-only — OK to keep | — |
| `elementor` (inactive) | Off — fine | — |

### Plugin-specific concerns

- **`gotmls` (Anti-Malware)** — runs scheduled scans. Check `wp cron event list` and move to low-traffic window. Could explain some off-hour CPU spikes.
- **`updraftplus`** — backup plugin. Verify schedule is off-peak.
- **`wt-smart-coupons-for-woocommerce`** — also hooks `woocommerce_before_calculate_totals`. Stacks cost on top of BOGO reconcile for every cart query.
- **`p0-connect`** — throws file-permission errors on every request (`Failed to open stream: .../uploads/plugin0/logs/plugin0_debug.log`). Fix the dir or deactivate.
- **`2.0.5/`** (Daraz BNPL payment plugin named as version) — produces PHP deprecation warnings on every load. Upgrade or rename.
- **`wp-graphql-woocommerce` (WooGraphQL)** — inherently expensive for cart/session queries; can't remove. Reinforces the case for query-level HTTP caching (see top).

---

## GraphQL query hygiene

- **`wp-graphql` introspection is on by default.** In production, disable or rate-limit it.
- **No query depth / complexity limits** observed. A malicious query can amplify server cost. Add `register_graphql_settings_field` for max depth (~10) and complexity limits.
- **No persisted queries.** Persisted queries pair with Smart Cache's selective caching — register the catalog operations as persisted so the frontend sends an ID instead of the full query body, and Smart Cache can cache by ID safely.

---

## Infrastructure / ops

- **Redis Object Cache is active and working** (drop-in loaded). Confirmed via `wp redis status`. No action.
- **Traefik ACME loop for `soketi-...coolify.freshpixl.com`** (NXDOMAIN, rate-limited by Let's Encrypt since Apr 21). Drives proxy CPU uselessly. Either add the DNS record or delete the route in Coolify.
- **One IP (`112.134.197.218`) accounts for ~24% of recent traffic.** Verify whether it's internal test traffic or external. If external, add a Traefik rate-limit middleware.
- **67 SSH sessions** from the `w` output — mostly Coolify's Laravel Horizon SSH-loopback monitoring. Normal for Coolify but adds baseline CPU.

---

## Execution order (highest impact first)

| # | Change | Est. impact | Effort | Risk |
|---|---|---|---|---|
| 1 | Enable WPGraphQL Smart Cache **selectively** (persisted queries + skip on session) so catalog reads are cached, cart/checkout/account are not | **~60–80% reduction in per-request CPU** | 4–6 hr | Medium — needs query registration |
| 2 | Add typed `bogo` GraphQL field in `wc-bogo-simple`, drop `bogoPluginMeta` from Next.js `ProductContentFull` | Big — per-row cost on every listing drops | 1–2 hr | Low |
| 3 | Deactivate the ~10 unused frontend-only plugins (Jetpack, AIOSEO, MonsterInsights, Site Kit, Hotjar, OptinMonster, UserFeedback, WPConsent, UnusedCSS, one of the migration plugins) | Medium — lowers baseline per-request cost | 30 min | Low (reversible) |
| 4 | Add cross-request BOGO reconcile cache (Redis-backed transient keyed by cart hash) | Medium — only helps cart-heavy workloads | 3–4 hr | Medium |
| 5 | Fix / deactivate `p0-connect` permission error | Small — removes per-request filesystem error | 15 min | Low |
| 6 | Cron audit (`gotmls`, `updraftplus`, other scheduled scans) → move to off-peak | Prevents scheduled spikes | 30 min | Low |
| 7 | Fix `soketi-...coolify.freshpixl.com` Traefik ACME loop | Cuts proxy-side noise | 10 min | Low |
| 8 | Add GraphQL query depth/complexity limits | Defensive — not a perf fix per se | 1 hr | Low |
| 9 | Pick one security plugin (Wordfence vs GOTMLS), one waitlist, one migration — uninstall the rest | Small | 30 min | Low |

---

## Why this is the right order

The top two items together address the root cause: every `/graphql` request currently does *both* the full resolver run *and* the custom-plugin postmeta scans. #1 removes the repeated work across requests, #2 removes the per-row work inside each catalog response. Plugin deactivation (#3) cuts the constant-cost overhead that every request pays regardless. Items #4–9 are tail optimizations.
