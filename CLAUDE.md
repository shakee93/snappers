# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# gq-headless

Next.js 16 App Router frontend for gqmobiles.lk. Talks to a WordPress + WooCommerce + WPGraphQL backend at `api.gqmobiles.lk`.

## Commands

```bash
npm run dev        # dev server (webpack mode)
npm run build      # production build
npm run lint       # ESLint (flat config at eslint.config.mjs)
npm run codegen    # regenerate TypeScript types from GraphQL schema
```

Codegen reads from `NEXT_PUBLIC_WP_GRAPHQL` and writes to `graphql/types/`. Run it after editing any file in `graphql/defs/`.

## Architecture

### App Router layout

Routes live under `app/` with three layout groups:
- `(chromed)` — public pages with header/footer (products, brands, account, checkout)
- `(payment)` — payment return/callback pages
- `(sitemaps)` — dynamic XML sitemap routes

API routes at `app/api/` handle payment webhooks (PayHere, Genie, Koko, NDB Pay, bank transfer) and cache revalidation.

### Dual Apollo clients

The most important architectural pattern: two separate Apollo clients serve different purposes.

**SSR client** (`graphql/apollo-ssr.ts`) — server components only. Uses Next.js `force-cache` (indefinite caching) at the fetch layer. Invalidated by WordPress firing a webhook to `/api/revalidate` when product/stock data changes. `registerApolloClient()` is the entry point.

**Client Apollo** (`graphql/apollo-client.tsx`) — browser only (`"use client"`). Injects JWT `Authorization` and `woocommerce-session` headers. An `errorLink` intercepts "Expired token" errors, auto-refreshes via `GET_AUTH_TOKEN` mutation, and retries the original request. Used for all user-scoped operations (cart, checkout, orders, account).

Never use the SSR client for user-scoped queries or the client Apollo in server components.

### GraphQL organization

Queries and fragments live in `graphql/defs/` as `*.ts` / `*.fragments.ts` pairs (e.g., `products.ts` + `products.fragments.ts`). Codegen produces typed document nodes in `graphql/types/`. Always import the generated `gql` tag from `graphql/types/gql` — it returns `TypedDocumentNode` and is what Apollo's types flow from.

Fragment masking is enabled; use the `useFragment` helper from `graphql/types/fragment-masking` rather than casting fragment types directly.

### Caching strategy

The SSR client caches forever at the Next.js fetch layer. The WordPress backend runs WPGraphQL Smart Cache (Redis, 10-min TTL + event-based purges). An explicit allowlist in `mu-plugins/graphql-cache-skip-session.php` ensures user-scoped operations (cart, customer, orders) bypass the cache. Stock accuracy is enforced client-side at add-to-cart time in case webhooks are missed.

### State management

Zustand stores handle client state (cart UI, auth state). Auth tokens (`AUTH_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `SESSION_TOKEN_KEY`, `USER_DATA_KEY`) are persisted in localStorage and read by the client Apollo authLink.

### Styling

Tailwind CSS 3 with a custom color system via CSS variables (`--c-primary-500`, etc.). NextUI component library is installed alongside. Dark mode is class-based. Custom animations are defined in `tailwind.config.ts`.

### Search

Typesense powers search (host: `search.gqmobiles.lk`). The integration uses `react-instantsearch` + `typesense-instantsearch-adapter`. Config comes from `NEXT_PUBLIC_TYPESENSE_*` env vars.

## Environment variables

Key vars (full list in Vercel dashboard):
- `NEXT_PUBLIC_WP_GRAPHQL` — WordPress GraphQL endpoint
- `NEXT_PUBLIC_DOMAIN` — base URL
- `NEXT_PUBLIC_TYPESENSE_*` — search backend
- `NEXT_PUBLIC_MERCHANT_ID`, `GQ_PAYHERE_MERCHANT_SECRET_KEY` — PayHere
- `GENIE_MERCHANT_ID`, `GENIE_API_KEY`, `GENIE_SANDBOX` — Genie

## Performance

This is a high-traffic production storefront. Treat performance as a correctness requirement, not a nice-to-have.

**Rendering**
- `useMemo` any value derived solely from props inside client components that have frequent state changes (hover, carousel, quantity). The computation cost is irrelevant — the principle is that prop-derived values should not recompute on unrelated state updates.
- Product card components are rendered in bulk (sliders, grids). A render-time cost that looks trivial for one instance multiplies across every visible card.

**Data fetching**
- Push filtering to the GraphQL layer (`where: { tagNotIn, stockStatus, tagIn }`) rather than fetching and discarding client-side. Client-side filtering against a `first: N` result set silently shrinks the output when items are excluded.
- Never add a field to a shared fragment (`ProductContentCard`, `ProductContentFull`) without confirming it is not already fetched. Widening a fragment widens every query that uses it.
- All parallel queries must use `Promise.all`. Never await them sequentially.
- Every new SSR page must export `revalidate`. The WP webhook is the primary cache invalidation path, but `revalidate` is the safety net when webhooks are missed.

## Code quality — write it right the first time

PRs on this repo receive thorough review. Every round trip costs time. The goal is to ship code that passes review on the first submission, not to iterate through reviewer feedback.

**Before opening a PR, verify every point below:**

**TypeScript**
- No `any` types. Use proper generics, discriminated unions, or `unknown` with narrowing.
- No `// @ts-ignore` or `// @ts-expect-error` unless accompanied by an explanation of why the types are genuinely wrong.
- All props must be typed. No implicit `{}` or untyped destructured props.

**React / Next.js**
- No unnecessary `"use client"` — keep server components as server components. Only push to the client what genuinely needs interactivity or browser APIs.
- No `useEffect` for derived state — compute it during render or via `useMemo`.
- No inline object/array/function literals passed as props to memoized children — they defeat memoization.
- Suspense boundaries must be present for every async client boundary.
- Never fetch in a client component what can be fetched in a server component above it.

**GraphQL / Data**
- Never add a field to a shared fragment without checking it isn't already fetched.
- Never fetch more data than the component uses. Trim fragment fields to exactly what is rendered.
- All SSR pages must export `revalidate`.
- Parallel data fetches use `Promise.all`, never sequential `await`.

**Performance (non-negotiable for this storefront)**
- `useMemo` every prop-derived value inside components that re-render on state changes.
- Never introduce a per-card computation in product sliders/grids — it multiplies across every visible card.
- No synchronous work in the render path that can be moved outside the component.

**Accessibility & markup**
- Interactive elements must be keyboard-accessible (`button`, not `div onClick`).
- Images must have meaningful `alt` text (not empty unless purely decorative).

**General**
- Remove all debug `console.log` statements before committing.
- No dead code — remove unused imports, variables, and components entirely.
- Keep each component doing one thing. If a component is doing layout + data fetching + business logic, split it.
- Match the surrounding code style exactly — spacing, naming conventions, file structure.

Run `npm run lint` and `npm run build` locally before pushing. A PR that fails CI is a wasted review cycle.

## Deployment / Git workflow

**Direct pushes to `main` are not allowed.** Every change — including small fixes — goes through review.

1. **Branch** off `main` (or an active feature branch if stacking on in-flight work):
   ```
   git checkout -b <type>/<short-description>
   ```
   Branch-name prefixes in use: `feat/`, `fix/`, `perf/`, `ci/`, `chore/`, `docs/`.

2. **Commit** with a conventional-commit-style subject that matches the prefix, e.g. `perf(graphql): trim metaData keysIn`. Keep the subject under ~70 chars; put detail in the body if needed.

3. **Push** the feature branch:
   ```
   git push -u origin <branch>
   ```

4. **Open a PR** against `main` with `gh pr create`. CI (lint workflow) runs on PRs — wait for it to pass.

5. **Review.** A human reviewer approves before merge. Do not self-merge.

6. **Merge** to `main` only via the approved PR.

Never: `git push origin main`, `git push --force` to `main`, or skip the PR step.
