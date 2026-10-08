---
name: gq-overview
description: "Project orientation for gq-headless - what the system is, where its pieces live, and how requests flow between them. Use this when starting work in this repo and you need the big picture before diving in: which repo owns what, where the backend lives, how the frontend talks to it, what changes go where, and which deeper skills/docs to read for specifics. Read this first; the gq-backend-debug skill is the deeper operational runbook for the backend."
---

# gq-headless - working guide

`gqmobiles.lk` is a Next.js storefront for GQ Mobiles (Sri Lanka). This repo (`gq-headless`) is the frontend; everything dynamic comes from a WordPress + WPGraphQL backend on a separate host. There is no monolith - the two halves are deployed and versioned independently.

If you only read one thing before starting work, read this.

## The two halves

| | Frontend | Backend |
|---|---|---|
| Public URL | `gqmobiles.lk` | `api.gqmobiles.lk` |
| Repo | `gq-headless` (this one) | `gq-backend-plugins` (separate, private) |
| Stack | Next.js 16 (App Router) + Apollo Client + Tailwind + NextUI | WordPress + WooCommerce + WPGraphQL + WooGraphQL |
| Hosting | Vercel | Self-hosted Docker on a Hetzner VPS, managed by Coolify |
| Cache | Vercel edge cache + ISR | Redis (object cache) + WPGraphQL Smart Cache |
| Search | Typesense (also self-hosted on the VPS) | - |

End-user request flow:

```
Browser → Vercel edge → Next.js (SSR/ISR) → POST /graphql → Traefik → Apache+PHP → WP+WC → MySQL/Redis
                                                                                  ↓
                                                                            (Typesense for search)
```

Most `/graphql` traffic comes from **Vercel SSR workers** (UA `node`, AWS Mumbai IPs) - not from end-user browsers. That's the single most important thing to remember when reading backend access logs: the "client IP" you see is almost always Vercel, not the user.

## What lives in THIS repo

```
app/                  Next.js App Router (route groups: (chromed), (payment))
  (chromed)/...       The main shopfront - homepage, PDPs, brands, collections, cart, checkout, etc.
  (payment)/checkout  Payment-only flow (split route group with its own layout)
  api/                Next.js route handlers (revalidate hooks, sitemaps, etc.)
graphql/
  defs/               Co-located GraphQL fragments + queries (the source for codegen)
  types/              GENERATED - do not edit by hand. Run `pnpm codegen` after editing defs.
  apollo-client.tsx   Browser Apollo client
  apollo-ssr.ts       Server Apollo client (used by RSC / SSR)
  graphql.schema.json GENERATED schema introspection
components/, containers/, shared/  React components
lib/                  Plain TS utilities (BOGO line pricing, JSON-LD, etc.)
store/                Zustand stores (cart, UI state)
hooks/                Custom React hooks
docs/                 Internal architecture/perf docs (NOT for public consumption - see warning headers)
scripts/              One-off CLI debug helpers
```

GraphQL endpoint comes from `NEXT_PUBLIC_WP_GRAPHQL` (set in `.env.local` for dev, in Vercel env for prod). Codegen reads from the same env to introspect the live schema.

## What lives in the BACKEND repo

`gq-backend-plugins` (cloned at `~/projects/gq-backend-plugins`) is the version-controlled mirror of:

- `mu-plugins/` - must-use plugins that load automatically (schema trimming, GraphQL caching, session-skip optimizations, tripwire, the Vercel log-drain receiver, etc.)
- `plugins/` - in-house custom plugins (e.g. `wc-bogo-simple` for BOGO/free-shipping rules, `p0-connect` for the Sri Lankan tax/HS-code engine)

The Docker volume on the VPS is the **live source**; the repo is the mirror. The repo's `bin/diff.sh` detects drift, `bin/deploy.sh` rsyncs → docker cp → chown → opcache_reset. **Always prefer the repo route for changes you'd want to review.** In-place edits via `docker exec` work but create drift the next `diff.sh` will surface.

## Caching - every layer matters

This site lives or dies by caching. A page can pass through up to **five** caches before MySQL ever sees a query. Knowing where each one sits is essential before you "fix" a perf issue or debug stale data.

```
Browser → Vercel edge cache → Next.js ISR/SSG output → Apollo (SSR) → WPGraphQL Smart Cache → Redis object cache → MySQL
                                                                ↘ OPcache (PHP bytecode, sits beside everything)
```

### 1. Vercel edge cache + Next.js ISR / on-demand SSG (the most impactful layer)

Most public pages - homepage, archive (brand/collection/tag), PDP - are statically generated and cached at the Vercel edge. **Removing `force-dynamic` and falling back to ISR is the single biggest perf lever** in this repo, and several recent commits (`perf(archive): cache brand/collection/tag pages at edge with on-demand SSG`, `perf(pdp): cache PDP HTML at edge by removing force-dynamic`) exist precisely for this.

- Pages opt into caching by *not* having `export const dynamic = 'force-dynamic'` and by using `generateStaticParams` for dynamic routes.
- Cache invalidation goes through Next.js route handlers under `app/api/` (revalidate hooks) - typically called by WordPress when content changes.
- `revalidate` on a page sets the ISR refresh window; pair it with on-demand revalidation for fresh-on-edit behavior.
- Beware: anything that reads cookies, headers, or `searchParams` opts the page out of static generation. Audit before adding those.

### 2. Apollo client cache

Two separate Apollo clients (`graphql/apollo-ssr.ts` for server, `graphql/apollo-client.tsx` for browser). The browser's `InMemoryCache` is normalised by `id`/`__typename`. Don't share or persist it across users; don't mix the two clients (the SSR client doesn't carry browser cookies).

### 3. WPGraphQL Smart Cache (Redis-backed, on the backend)

WPGraphQL caches GraphQL responses keyed by query + variables. The `graphql-cache-skip-session.php` mu-plugin **forces it to skip cache for any request carrying a session/auth header** (cart, account, checkout) - that's why anonymous PDPs are fast and signed-in carts are always fresh.

### 4. Redis object cache (the WP `wp_cache_*` API)

Backs WordPress's `WP_Object_Cache` and is also where the in-house mu-plugins store their custom caches (e.g., the navigation-categories response, public-user data). **Redis serializes PHP `true` as `"1"`** - `wp_cache_get(...) === true` will always fail; use `!== false` (false = miss) or store an unambiguous value. `save ""` is set on the Redis container, so it's cache-only - restarts wipe it unless you `BGSAVE` first.

### 5. PHP OPcache (bytecode, not data)

Caches compiled PHP. Configured with `validate_timestamps=0` for production performance, which means **edits to backend PHP files have NO effect until OPcache is reset** - graceful Apache reload, or the `bin/deploy.sh` script does it for you. If a freshly-deployed plugin behaves like the old version, this is almost always why.

### Frontend perf contract

The frontend's job is to **ask for less**, not to bypass caches. Recent perf wins have been about trimming what the frontend requests:

- `perf(graphql): trim metaData keysIn` - fetch only the meta keys actually used
- `perf(cart): slim cart fragment + displayValue for variation attrs` - drop unused fields from the cart query
- `perf(graphql): split listings off the full product fragment` - listing fragment ≠ PDP fragment

When debugging "slow page", grep `graphql/defs/` first - the cheapest fix is often removing a field nobody renders.

## Workflow rules

These come from `CLAUDE.md` (project root). Don't violate them - every change is reviewed:

1. **No direct pushes to `main`.** Branch off main, push the branch, open a PR with `gh pr create`, wait for CI lint to pass, get human review, merge through GitHub.
2. **Branch-name prefixes:** `feat/`, `fix/`, `perf/`, `ci/`, `chore/`, `docs/`. Match the conventional-commit subject prefix (e.g. branch `perf/cache-x` → commit `perf(cache): trim x`).
3. **Never `git push origin main`, never `--force` to main.**
4. Backend plugin changes go through the `gq-backend-plugins` PR flow, not this repo.

## Where to look for what

| You're trying to… | Look here |
|---|---|
| Understand the project / pick where to start | `.claude/skills/gq-overview/SKILL.md` (this file) |
| Debug a backend issue (load, 500s, slow queries) | `.claude/skills/gq-backend-debug/SKILL.md` - the operational runbook with tested commands |
| Read deeper backend architecture (mu-plugin internals, why each one exists) | `docs/backend-guide-dev.md` - internal, do not share |
| Read frontend perf history | `docs/PERFORMANCE-NEXTJS.md`, `docs/PERFORMANCE-WORDPRESS.md` |
| Edit a GraphQL query / fragment | `graphql/defs/...`, then run `pnpm codegen` |
| Understand cart-line / BOGO pricing on the client | `lib/cartLinePricing.ts`, `lib/bogo.ts` |
| Trim what fields the frontend asks for (perf) | `graphql/defs/` - often the cheapest perf win is removing unused fragment fields |
| Configure a BOGO rule or per-product free shipping | wp-admin → Products → edit → General tab (the `wc-bogo-simple` plugin renders the fields) |

## Common operations / commands

```bash
# Frontend dev
pnpm install
pnpm dev                          # Next.js dev server (webpack)
pnpm codegen                      # regenerate graphql/types/ from the live schema
pnpm lint                         # eslint
pnpm build                        # production build

# SSH to backend VPS (alias is in ~/.ssh/config; uses ControlMaster for ~6× faster reconnects)
ssh GQ-API

# Quick backend health (full triage in gq-backend-debug skill)
ssh GQ-API 'uptime; top -bn1 | head -5'
```

## Conventions worth knowing on day 1

- **Apollo SSR vs browser clients are separate** (`graphql/apollo-ssr.ts` vs `graphql/apollo-client.tsx`). SSR client hits the backend directly without browser cookies; the browser client handles the user session. Don't mix them.
- **Server Components are the default**; mark with `"use client"` only when you need state, effects, or browser APIs. Most page shells stay server-rendered for ISR cacheability.
- **Cart, BOGO, and free-shipping math is computed on the backend** (in the `wc-bogo-simple` plugin's `before_calculate_totals` hook) and reflected in the GraphQL cart response. The frontend should display, not recompute. `lib/bogo.ts` and `lib/cartLinePricing.ts` exist to format what the backend returns, not to invent rules.
- **OPcache on the WP container has `validate_timestamps=0`** for production performance. Backend code edits do NOT take effect until opcache is reset (graceful Apache reload, or the deploy script's opcache_reset step). If a freshly-deployed plugin behaves like the old version, that's almost always why.
- **Sri Lanka peak traffic is evenings IST (~14:00–18:00 UTC).** Expect 2–3× baseline. Avoid risky changes during that window.

## What this skill does NOT cover

- Specific backend tuning history (compose values, mu-plugin internals): see `gq-backend-debug` and `docs/backend-guide-dev.md`.
- Server credentials, container names, drain tokens, IPs: kept out on purpose. Use the SSH alias `GQ-API`; sensitive details are loaded by the `gq-backend-debug` skill on demand.
- Per-feature design docs: live in `docs/` if they exist, otherwise in PR descriptions / commit messages.
