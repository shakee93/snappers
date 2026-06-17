# Backend mu-plugins (canonical copies)

This project has **no separate backend repo**, so the WordPress mu-plugins that
the headless storefront depends on are tracked here as the canonical source.
They run on the WP server (Coolify/Docker), **not** in this Next.js app.

| File | Purpose |
|------|---------|
| `headless-wishlist.php` | WPGraphQL `wishlist` query + `addToWishlist` / `removeFromWishlist` mutations, bridging to the YITH WooCommerce Wishlist plugin. User-scoped via JWT. |
| `headless-auth-header.php` | Exposes a **valid** `Authorization` Bearer token to `$_SERVER` (mod_php strips it here, so JWT auth was reading every request as guest), and overrides the theme's 10s JWT token TTL to 1h. |

## Live location

```
/var/www/html/wp-content/mu-plugins/headless-wishlist.php
/var/www/html/wp-content/mu-plugins/headless-auth-header.php
```

## Server-side changes NOT tracked in this repo

These edits were made to **existing** server files (they live on the server, not
here). Re-apply if the backend is rebuilt:

- **`mu-plugins/tripwire.php`** — added `headless-wishlist.php` and
  `headless-auth-header.php` to the `$expected` mu-plugin allowlist (otherwise
  the tripwire logs them as unexpected files).
- **`mu-plugins/graphql-cache-skip-session.php`** — no change needed: the
  wishlist operations are intentionally **kept off** the Smart Cache allowlist
  because they are user-scoped and must never be cached.

## Deploy

```bash
# from this folder, for each changed file:
scp headless-wishlist.php root@<server>:/tmp/
ssh root@<server> '
  C=<wordpress-container>
  docker cp /tmp/headless-wishlist.php $C:/var/www/html/wp-content/mu-plugins/
  docker exec $C chown www-data:www-data /var/www/html/wp-content/mu-plugins/headless-wishlist.php
  docker exec $C php -l /var/www/html/wp-content/mu-plugins/headless-wishlist.php
'
```

**OPcache gotcha:** this WP has `opcache.validate_timestamps = Off`, so editing a
PHP file on disk has **no effect** until OPcache is reset. The CLI OPcache is
separate from Apache's, so reset via a web request:

```bash
docker exec $C sh -c 'printf "<?php opcache_reset();" > /var/www/html/_oc.php; \
  curl -s http://localhost/_oc.php >/dev/null; rm -f /var/www/html/_oc.php'
```
