# Backend Dev Guide - `api.gqmobiles.lk`

> **INTERNAL - DO NOT SHARE.** This document contains backend topology, the
> production VM IP, container names, mu-plugin internals, Redis key shape, and
> CDN identifiers. No secrets, but the combination is a recon-friendly map of
> `api.gqmobiles.lk`. Treat it as confidential: do not link from public docs,
> do not paste into external tickets, and do not include it in screenshots
> shared outside the team. Owners of this repo only.

Living doc. What's deployed on the WP backend, why, and how to revert each piece. This is the thing to read first when resource usage spikes, something breaks, or you're continuing perf work.

## Topology

- Host: `37.60.235.46`, 8-core VM, managed by Coolify.
- Containers of interest:
  - `wordpress-xko4k0w4ks0sw84kw8o0sksg` - Apache + PHP 8.3 + WP, runs as uid 33 (`www-data`).
  - `wpcli-xko4k0w4ks0sw84kw8o0sksg` - wp-cli helper, uid 82 Alpine (uid mismatch with Apache - see Caveats).
  - `mysql-xko4k0w4ks0sw84kw8o0sksg`
  - `redis-xko4k0w4ks0sw84kw8o0sksg` - used both for WP object cache and WPGraphQL Smart Cache.
  - `typesense-…` - search index.
- Traefik terminates TLS. Coolify stores the compose YAML inside its Laravel DB (`Service::docker_compose_raw`) - to patch it durably, UPDATE the row and let Coolify redeploy. Do **not** hand-edit the live container's compose.
- Frontend (`gqmobiles.lk`) is Next.js on Vercel. Virtually all `/graphql` traffic comes from Vercel SSR workers in `ap-south-1` with User-Agent `node`. Real browsers are a rounding error.

## mu-plugins in production

All live in `/var/www/html/wp-content/mu-plugins/`. mu-plugins load automatically, no UI toggle. Delete the file to revert.

### `graphql-cache-skip-session.php` (v0.2.0)

Forces WPGraphQL Smart Cache to skip cache for requests carrying a session/auth header (cart, account, checkout). Also writes a per-request audit entry to `/tmp/smart-cache-audit.log` - now a pure I/O tax since the cache behavior is proven stable. **TODO**: remove the audit-log block.

### `graphql-disable-block-templates.php` (v0.1.0)

Short-circuits Gutenberg FSE block-template discovery on `/graphql` requests only. Filters: `pre_get_block_templates`, `pre_get_block_file_templates`, `pre_get_block_template`, `pre_get_block_file_template`. Saved **~1.8 s per request** per Tier-2 profiler measurement. Zero risk - GraphQL never renders HTML.

### `graphql-schema-trim.php` (v0.2.0)

Hides unused taxonomies and post types from the WPGraphQL schema to shrink `init_graphql_type_registry` cost (baseline ~6 s/request). **Filter priority `PHP_INT_MAX`** is required - WPGraphQL or WooCommerce re-sets `show_in_graphql=true` at default priority 10 and overrides a lower-priority hook.

Hidden:
- Taxonomies: `post_format`, `product_type`, `product_visibility`, `product_shipping_class`, `graphql_document_group`
- Post types: `shop_order_refund`, `graphql_document`

**Explicitly KEPT** even though the root query is unused - their TYPE is referenced by other resolvers (hiding them cascades into "null is not callable" 500s):
- `attachment` → `MediaItem` (every `image { sourceUrl }` uses it)
- `post`, `page`, `category`, `post_tag` (interfaces / fallback types)

Audit date: 2026-04-23. Re-audit if FE adds new queries against these.

### `backend-noindex.php` (v0.1.0)

Prevents Google from indexing `api.gqmobiles.lk`. Two layers:
1. `X-Robots-Tag: noindex, nofollow, noarchive` on every PHP response.
2. `robots.txt` override → `Allow: /wp-content/uploads/` + `Disallow: /`.

Image SEO for `gqmobiles.lk` is preserved because `/wp-content/uploads/*` is served by Apache's static handler (PHP never runs, so the header never attaches) **and** robots.txt explicitly allows the uploads path for Googlebot-Image.

The Next.js frontend handles its own meta (hand-built from `product.name`/`brand.name`), so AIOSEO is not needed on this host - deactivated 2026-04-23.

## Smart Cache reality check

- Plugin: `wpgraphql-smart-cache` v2.0.1. Settings: `cache_toggle: on`, `global_max_age: 600`.
- Redis keys:
  - `wp:gql_cache:list-<type>` - cache tag group per content type
  - `wp:gql_cache:term:<id>`, `wp:gql_cache:post:<id>` - tag groups per entity
  - `wp:gql_cache:<64-char-hex>` - actual cached responses (10 KB+ payloads)
- Count as of 2026-04-23: ~18,900 keys.

**Critical gotcha**: Smart Cache v2 **only serves cache for GET requests or POST with `queryId`** (persisted queries). The audit log's `WOULD_CACHE` is aspirational; the actual serve path requires the right request shape.

The frontend uses Apollo's `HttpLink`, which POSTs with the query body. **Every SSR request is a cache MISS** and runs the full ~3 s pipeline. This is the largest unresolved contributor to backend CPU.

**Do NOT** flip `useGETForQueries: true` on the client as-is:
1. Some queries have variables large enough to exceed safe URL length.
2. Authenticated requests (cart/account) would start being cached if the path was GET-cacheable.
3. CDN caching on top would poison stock counts.

The escape hatch is **per-query `next: { revalidate: N }`** on editorial queries only (brands, top bar, attributes, hero sliders) - never on product/cart/account. Only `(product)/[brand]/[slug]/page.tsx:43` currently does this.

Smart Cache does **not** cache the schema - only responses. That means `init_graphql_type_registry` runs on every request including cache hits.

## Deactivated plugins

Audit date 2026-04-23. All were unused-or-low-value on this headless stack.

| Plugin | Why | How |
|---|---|---|
| `gotmls` | Not needed; backend blocked from public reach | `wp plugin deactivate` |
| `updraftplus` | We back up at VM/DB level elsewhere | idem |
| `google-site-kit` | Frontend handles analytics | idem |
| `all-in-one-wp-migration` | One-shot tool, not ops | idem |
| `hotjar` | Frontend-only concern | idem |
| `optinmonster` | Frontend-only concern | idem |
| `all-in-one-seo-pack` | Next.js sets its own meta; grepped repo for `aioseo`, zero references | deactivated via temporary object-cache.php rename to bypass its Redis-flushing deactivate hook |

**AIOSEO deactivation gotcha**: its `deactivate()` hook calls `wp_cache_flush()` → synchronous `FLUSHDB` over 1 M keys → predis timeout → "Error while reading line from the server." Workaround: rename `/var/www/html/wp-content/object-cache.php` to `.bak` for the duration of the deactivation, then restore.

Also invalidate `wp:options:alloptions` in Redis after any plugin activation/deactivation or the `active_plugins` list looks stale.

## Profiler (removed)

`graphql-plugin-timing.php` was deployed briefly to attribute wall-time by plugin and by hook. Key findings it produced:
- `init_graphql_type_registry` ≈ **6.2 s/request** (40% of p50 total)
- `do_graphql_request` ≈ **4.2 s/request**
- `get_block_templates` ≈ **0.8 s/request × 95 of 106 reqs** → motivated `graphql-disable-block-templates.php`
- Every active plugin's wall-time share per cache-miss request

**Redeploy the profiler from `/tmp/graphql-plugin-timing.php` (retrievable via git history of this doc's commits or from conversation transcript) when you need fresh numbers.** Always `chown www-data:www-data` the file or it will sit silently without executing.

## Known issues / pending

- **7% of `/graphql` POSTs return 500** under load (13/177 baseline). Root cause not yet diagnosed; suspected schema-init timeout under saturation. Monitor `docker logs --since 5m wordpress-… | grep 'POST /graphql' | awk '$9==500'`.
- **p0-connect log spam**: wp-cli commands throw `file_put_contents(/var/www/html/wp-content/uploads/plugin0/logs/plugin0_debug.log): Permission denied` because the wpcli container is Alpine (uid 82) and the log file is owned by Apache's `www-data` (uid 33). Cosmetic - Apache runtime is unaffected. Fix options: `chmod 666` on the log, or rebuild wpcli on a Debian base image with matching uid. Earlier we had to `rm` a 3 GB runaway version of this file.
- **Coolify-managed compose has been DB-patched twice** (`install-php-extensions redis`, then OPcache tuning + healthcheck `interval: 2s → 30s`). Patches live in `/tmp/coolify-*.php` scripts on the host - idempotent, run via `php artisan tinker` against the Coolify DB. If you redeploy the service from the Coolify UI without re-applying, you lose these.
- **BunnyCDN pull zone 3799419** cached a 503 from a prior outage with 1-year max-age. Cloudflare sits in front of Bunny. Three-layer purge (Bunny + Cloudflare + origin Cache-Control fix on 5xx) was drafted but not executed - ask before touching.
- **Custom WP image with phpredis pre-baked** would eliminate ~60-90 s container-recreate downtime caused by `install-php-extensions redis` on every boot.
- **BOGO typed GraphQL field** (wc-bogo-simple plugin) still pending.
- **WP cron audit** and **query depth/complexity limits** pending.

## How to measure the thing that matters

```bash
# Load and CPU snapshot
ssh root@37.60.235.46 'uptime; docker stats --no-stream --format "{{.Name}} CPU={{.CPUPerc}} MEM={{.MemUsage}}" | grep -E "wordpress|mysql|redis"'

# Current /graphql rps and status distribution (last 60 s)
ssh root@37.60.235.46 'docker logs --since 60s wordpress-xko4k0w4ks0sw84kw8o0sksg 2>&1 | grep "POST /graphql" | wc -l'
ssh root@37.60.235.46 'docker logs --since 60s wordpress-xko4k0w4ks0sw84kw8o0sksg 2>&1 | awk "/POST \/graphql/ {print \$9}" | sort | uniq -c'

# Smart Cache key inventory
ssh root@37.60.235.46 'PW=$(docker exec redis-… printenv REDIS_PASSWORD); docker exec redis-… redis-cli -a "$PW" --no-auth-warning --scan --pattern "wp:gql_cache:*" | wc -l'

# OPcache health
ssh root@37.60.235.46 'docker exec wordpress-… curl -s http://127.0.0.1/opstat.php | head -40'

# Audit: what taxonomies/post types are exposed in GraphQL right now
ssh root@37.60.235.46 'docker exec --user www-data wpcli-… wp eval "foreach(get_taxonomies([], \"objects\") as \$t) if(!empty(\$t->show_in_graphql)) echo \$t->name.PHP_EOL;"'
```

## Deploy checklist for a new mu-plugin

1. Write to `/tmp/<name>.php` locally or paste inline via `docker exec wordpress-… bash -c "cat > …"` with a heredoc.
2. `docker exec wordpress-… chown www-data:www-data /var/www/html/wp-content/mu-plugins/<name>.php`
3. `docker exec wordpress-… php -l /var/www/html/wp-content/mu-plugins/<name>.php` - syntax check.
4. Smoke-test `curl -sI https://api.gqmobiles.lk/graphql` and a real query - 10 in a row to distinguish real breakage from baseline 7% 500 rate.
5. Snapshot load avg before/after (30 s apart minimum).
6. Update this doc.

## Don't forget

- Every mu-plugin file must be `chown www-data:www-data` or it silently doesn't execute.
- Use filter priority `PHP_INT_MAX` on `register_taxonomy_args` / `register_post_type_args` - WPGraphQL overrides at priority 10.
- Hiding a post type from GraphQL also removes its TYPE. If another query references that type, you get "null is not callable" 500s. Test before and after.
- `wp plugin …` commands running through wpcli-xko4… hit the uid-82 vs uid-33 permission wall for any file Apache created. Use `--allow-root` from inside the wordpress container if needed.
- After any plugin activation/deactivation, invalidate `wp:options:alloptions` in Redis.
