# WordPress Backend Performance Findings

Context: WP runs inside Docker on `37.60.235.46` (container `wordpress-xko4k0w4ks0sw84kw8o0sksg`). Under load the container has hit **1246% CPU** (12+ cores) with load averages spiking to 110. MySQL peaks at 208%. The Next.js frontend (Vercel) is a heavy `/graphql` client, and the Apr 20 BOGO deploy stepped baseline load from ~3 → 8–19.

---

## Shipped

**2026-04-23 - `wp_rapidload_job` full-scan eliminated**
- Diagnosed via `performance_schema.events_statements_summary_by_digest` (top query by total time): `SELECT * FROM wp_rapidload_job WHERE URL = ?` had 517 K executions, 7.2 hours of CPU, **4.46 B rows examined** because the RapidLoad plugin wrote `url LONGTEXT` with no index - every lookup was a full scan of ~9 K rows.
- Truncated the table (safe - it's an on-demand optimization-jobs cache) and added `ADD INDEX idx_url (url(191))`.
- **Measured effect:** MySQL CPU 182% → ~20% within two minutes.

**2026-04-23 - WPGraphQL Smart Cache enabled via an operation allowlist**
- Flipped `graphql_cache_section.cache_toggle: off → on` and `log_purge_events: off → on`. `global_max_age` kept at 600 s.
- Installed mu-plugin `wp-content/mu-plugins/graphql-cache-skip-session.php` (v0.2.0) that hooks `graphql_cache_is_object_cache_enabled` and returns `true` **only if the incoming operation name is in an explicit allowlist** of session-independent catalog/chrome/sitemap operations. Everything else - including anything the frontend adds later - bypasses by default. See *How the GraphQL cache works* below for the allowlist and reasoning.
- Earlier blacklist approach (v0.1.0, regex on `cart|checkout|…` + `woocommerce-session` header bypass) was tried first and **reverted after an empty-cart-on-reload regression in incognito**. Post-mortem: the cart itself was fine (`CartProvider` is `'use client'` with `fetchPolicy: 'no-cache'` - never fetched in SSR), but Smart Cache's cache key is `(query, variables, operationName)` and doesn't vary on session headers, so any request without a session could pollute a cache entry that a different guest then read. A blacklist is one-regex-away from breaking; an allowlist fails closed.
- **Measured effect:** WP container CPU 859% → ~541% within 60 s of enabling v0.2.0; audit log shows ~92% of real traffic (Vercel SSR + unauthenticated catalog browsing) in the allowlist, remainder (cart/customer/checkout/mutations) correctly bypassing.

**2026-04-23 - operational cleanup (not a structural fix)**
- Reaped ~30 stale `docker exec ... tail /var/log/apache2/...` shells that prior debugging had left running for up to a day; graceful `apache2ctl -k graceful` to recycle 121 Apache workers → 48. Container RSS dropped 6.99 GiB → 3.5 GiB. Listed for auditability.

---

## How the GraphQL cache works

### Components

- **WPGraphQL Smart Cache** (plugin, active) - caches query responses in the WP object cache.
- **Redis Object Cache** (plugin + `wp-content/object-cache.php` drop-in, active) - backs the WP object cache with Redis. Smart Cache's entries land there automatically.
- **`wp-content/mu-plugins/graphql-cache-skip-session.php`** - the policy. Tells Smart Cache *which* operations it's allowed to cache.
- **`graphql_cache_section` option** - `cache_toggle`, `log_purge_events`, `global_max_age`. Managed via `wp option patch update graphql_cache_section …`.

### The allowlist

Smart Cache's native key is `(query, variables, operationName)`. It does **not** vary on cookies or custom headers. That means any operation whose response depends on session (cart contents, customer fields, current-user-scoped orders, checkout context) is unsafe to cache - one guest's response can be served to another.

The mu-plugin enforces a strict allowlist. If the incoming `operationName` isn't in the list, the filter returns `false` and Smart Cache bypasses both the read and write path. This means a new GraphQL operation added to the frontend is **not cached by default** - you have to opt it in.

Currently allowlisted (see `gq_graphql_cache_allowlist()` in the mu-plugin for the canonical source):

- **Product catalog (23):** `GetProduct`, `GetProductsByDatabaseIds`, `GetProductByDatabaseId`, `GetProductsBogoPluginMeta`, `GetProductVariationByDatabaseId`, `GetTagDetailsBySlug`, `GetAllProducts`, `productSlugs`, `productCategories`, `GetAllProductVariations`, `GetBrandArchive`, `GetCategoryArchive`, `GetCategoryArchiveInStock`, `getProductsNode`, `getProductsNodeHomePage`, `GetProductsByBogoTag`, `GetProducts`, `GetProductsByBrand`, `GetBrandProducts`, `techspec`, `quickview_product`, `GET_NEW_ARRIVALS`, `getAllProductAttributes`
- **Brands / categories / nav (8):** `GetNavCategories`, `GetNavBrands`, `GetNestedProductCategoriesForArchive`, `getBrands`, `getAllBrands`, `GetBrand`, `GetCategory`, `GetBrandDetails`
- **Homepage / site chrome (4):** `HeroSection`, `SlidePostType`, `getReviews`, `OptionsTopBar`
- **Sitemap / SSG (3):** `GetSitemapProducts`, `GetSitemapBrands`, `GetSitemapCollections`

Explicitly **never** cached (they do not appear in the allowlist): `GetCart`, `GetPayment`, `getAccountDetails`, `getMyOrders`, `getOrder`, `GET_ORDRE_DETAILS`, `getShippingDetails`, `GET_CHECKOUT_USER_DETAILS`, `paymentDetails`. All mutations are skipped by Smart Cache itself regardless.

### Invalidation

Two mechanisms run in parallel; an entry is fresh only while both say "valid":

1. **TTL: `global_max_age` = 600 s** (10 minutes). Backstop for anything that skips the purge hooks.
2. **Event-based purge.** Smart Cache annotates each cached response with `X-GraphQL-Keys` listing every post/term it resolved (base64 `cG9zdDoxMjM=` = `post:123`, `dGVybTo0Ng==` = `term:46`). With `log_purge_events: on`, WordPress hooks (`save_post`, `updated_post_meta`, `woocommerce_product_set_stock`, `woocommerce_variation_set_stock`, taxonomy events, comment events, …) map the changed ID back to all tagged entries and purge them sub-second. This covers admin edits, WC REST updates, WooGraphQL mutations, and stock decrements from order placement. External flows that update postmeta via raw SQL bypass this and must wait for the TTL.

### Audit log (dry-run tooling)

The mu-plugin also hooks `graphql_request_results` and writes one line per request to `/tmp/smart-cache-audit.log` inside the WP container:

```
[HH:MM:SS] op=<operationName> decision=WOULD_CACHE|WOULD_SKIP sess=Y|N auth=Y|N ua=node|browser|other
```

This runs regardless of `cache_toggle`, so you can leave caching off, let traffic hit, then audit who would be cached before enabling. It's what was used to validate v0.2.0.

The audit block should be **removed** once you're confident (it does a small filesystem write per request). Done in place via editing the mu-plugin file.

### Adding a new operation to the cache

1. Confirm the new operation's response is session-independent. If any field reads from `cart`, `customer`, `viewer`, or similar, it isn't - stop.
2. Add the operation name to the `$allow` array in `wp-content/mu-plugins/graphql-cache-skip-session.php`.
3. Deploy the mu-plugin (ship the change in the repo if the file is tracked; otherwise `docker cp` into the container + `chown www-data:www-data`).
4. Watch `/tmp/smart-cache-audit.log` for 5–10 min to confirm the new op shows `WOULD_CACHE` only when expected.

### Operational commands

```bash
# Check current state
docker exec wpcli-xko4k0w4ks0sw84kw8o0sksg wp --allow-root option get graphql_cache_section --format=json

# Enable / disable
docker exec wpcli-xko4k0w4ks0sw84kw8o0sksg wp --allow-root option patch update graphql_cache_section cache_toggle on
docker exec wpcli-xko4k0w4ks0sw84kw8o0sksg wp --allow-root option patch update graphql_cache_section cache_toggle off

# Flush all cached entries (emergency)
docker exec redis-xko4k0w4ks0sw84kw8o0sksg sh -c 'echo FLUSHDB | redis-cli -a "$(printenv REDIS_PASSWORD)"'

# Verify a response was cache-fed (look for the extension)
curl -s -X POST https://api.gqmobiles.lk/graphql \
  -H 'content-type: application/json' \
  -d '{"operationName":"OptionsTopBar","query":"query OptionsTopBar { topBarBgColor }"}' \
  | jq '.extensions.graphqlSmartCache'
# cached hit → { graphqlObjectCache: { message: "This response was not executed at run-time…", cacheKey: "…" } }
# miss        → { graphqlObjectCache: [] }
```

### Outstanding concerns

- `wt-smart-coupons-for-woocommerce` - verify it does not inject per-customer pricing into public catalog responses. If it does, either the offending fields need to move behind an authenticated-only path, or the affected operation(s) must leave the allowlist.
- Removing the audit-log block from the mu-plugin once the allowlist has been validated against a broader traffic window (target: after 24 h of production traffic with no alarms).

---

## Custom BOGO plugin (`wc-bogo-simple/wc-bogo-simple.php`, v2.0.1, 811 lines)

Hooks reviewed: `woocommerce_before_calculate_totals@20`, `woocommerce_cart_item_name`, product/variation save hooks, GraphQL-tag sync.

### 1. No dedicated GraphQL field - biggest structural issue

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
- Calls `wc_get_product()` per configured free product ID (line 442) - DB hit each
- Mutates the cart via `add_to_cart` / `remove_cart_item` / `set_quantity` - these can re-trigger downstream hooks (the `$is_processing` static guards against re-entrance, good)

The reentrance guard and `$last_reconcile_fingerprint` are **static-per-PHP-request**. They help only within a single request. Cross-request, every identical cart re-runs the full reconcile.

**Fix:** cache the (cart-contents-hash → reconcile decision) in WP transients / Redis keyed by the cart session. Skip reconcile entirely when the hash matches a recent one. The existing fingerprint function (line 526) already computes the right hash.

### 3. Duplicate legacy meta read

`get_configured_free_product_ids()` (line 676) reads `_wc_bogo_free_product_ids`, then unconditionally also checks `_wc_bogo_free_product_id`. Short-circuit if the first returns non-empty.

### 4. `wc_get_product()` inside tight loop

Line 442 - `wc_get_product($free_product_id)` per free ID per paid cart item. For carts with BOGO products referencing multiple free variations, this is O(paid × free). Preload with a single `WC_Product_Data_Store_CPT::get_products()` by IDs instead.

### 5. `sync_bogo_catalog_product_tag()` on every product save - OK

Acceptable. Admin-only path.

---

## Plugin bloat - active on every `/graphql` request

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
| `woocommerce-email-template-customizer` | Admin-only - OK to keep | - |
| `elementor` (inactive) | Off - fine | - |

### Plugin-specific concerns

- **`gotmls` (Anti-Malware)** - runs scheduled scans. Check `wp cron event list` and move to low-traffic window. Could explain some off-hour CPU spikes.
- **`updraftplus`** - backup plugin. Verify schedule is off-peak.
- **`wt-smart-coupons-for-woocommerce`** - also hooks `woocommerce_before_calculate_totals`. Stacks cost on top of BOGO reconcile for every cart query.
- **`p0-connect`** - throws file-permission errors on every request (`Failed to open stream: .../uploads/plugin0/logs/plugin0_debug.log`). Fix the dir or deactivate.
- **`2.0.5/`** (Daraz BNPL payment plugin named as version) - produces PHP deprecation warnings on every load. Upgrade or rename.
- **`wp-graphql-woocommerce` (WooGraphQL)** - inherently expensive for cart/session queries; can't remove. Reinforces the case for query-level HTTP caching (see top).

---

## GraphQL query hygiene

- **`wp-graphql` introspection is on by default.** In production, disable or rate-limit it.
- **No query depth / complexity limits** observed. A malicious query can amplify server cost. Add `register_graphql_settings_field` for max depth (~10) and complexity limits.
- **No persisted queries.** Persisted queries pair with Smart Cache's selective caching - register the catalog operations as persisted so the frontend sends an ID instead of the full query body, and Smart Cache can cache by ID safely.

---

## Infrastructure / ops

- **Redis Object Cache is active and working** (drop-in loaded). Confirmed via `wp redis status`. No action.
- **Traefik ACME loop for `soketi-...coolify.freshpixl.com`** (NXDOMAIN, rate-limited by Let's Encrypt since Apr 21). Drives proxy CPU uselessly. Either add the DNS record or delete the route in Coolify.
- **One IP (`112.134.197.218`) accounts for ~24% of recent traffic.** Verify whether it's internal test traffic or external. If external, add a Traefik rate-limit middleware.
- **67 SSH sessions** from the `w` output - mostly Coolify's Laravel Horizon SSH-loopback monitoring. Normal for Coolify but adds baseline CPU.

---

## Execution order (highest impact first)

| # | Change | Est. impact | Effort | Risk |
|---|---|---|---|---|
| 1 | ~~Enable WPGraphQL Smart Cache **selectively** (persisted queries + skip on session) so catalog reads are cached, cart/checkout/account are not~~ **Done 2026-04-23** via guest-session-header + op-name bypass mu-plugin. Persisted-query path deferred (not required for current win). | **~60–80% reduction in per-request CPU** | 4–6 hr | Medium - needs query registration |
| 2 | Add typed `bogo` GraphQL field in `wc-bogo-simple`, drop `bogoPluginMeta` from Next.js `ProductContentFull` | Big - per-row cost on every listing drops | 1–2 hr | Low |
| 3 | Deactivate the ~10 unused frontend-only plugins (Jetpack, AIOSEO, MonsterInsights, Site Kit, Hotjar, OptinMonster, UserFeedback, WPConsent, UnusedCSS, one of the migration plugins) | Medium - lowers baseline per-request cost | 30 min | Low (reversible) |
| 4 | Add cross-request BOGO reconcile cache (Redis-backed transient keyed by cart hash) | Medium - only helps cart-heavy workloads | 3–4 hr | Medium |
| 5 | Fix / deactivate `p0-connect` permission error | Small - removes per-request filesystem error | 15 min | Low |
| 6 | Cron audit (`gotmls`, `updraftplus`, other scheduled scans) → move to off-peak | Prevents scheduled spikes | 30 min | Low |
| 7 | Fix `soketi-...coolify.freshpixl.com` Traefik ACME loop | Cuts proxy-side noise | 10 min | Low |
| 8 | Add GraphQL query depth/complexity limits | Defensive - not a perf fix per se | 1 hr | Low |
| 9 | Pick one security plugin (Wordfence vs GOTMLS), one waitlist, one migration - uninstall the rest | Small | 30 min | Low |

---

## Why this is the right order

The top two items together address the root cause: every `/graphql` request currently does *both* the full resolver run *and* the custom-plugin postmeta scans. #1 removes the repeated work across requests, #2 removes the per-row work inside each catalog response. Plugin deactivation (#3) cuts the constant-cost overhead that every request pays regardless. Items #4–9 are tail optimizations.
