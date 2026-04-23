# Next.js / Frontend Performance Findings

Context: site is headless Next.js 15 + Apollo + WPGraphQL. The BOGO / free-gift feature merged on Apr 20 (PR #30) caused a step-change in `/graphql` load on the WP backend (load avg 2–5 → 8–19 sustained). Findings here go beyond BOGO itself.

File paths and line numbers are from `main` at `2040cb0`.

---

## Tier 1 — highest-impact, low-risk fixes

### BOGO feature

1. **`ProductContentFull` fragment got `bogoPluginMeta` appended** (`graphql/defs/products.fragments.ts:204-214`) and now runs a 6-key `metaData` lookup for every product in every listing (homepage sliders, category, brand, related, tag archive). Split into two fragments: `ProductContentCard` (listings, slim) and `ProductContentFull` (PDP only).

2. **`happiestCustomersGallery` added to both `SimpleProduct` and `VariableProduct` in `ProductContentFull`** (`products.fragments.ts:482,512`). Only used on PDP. Move to a PDP-only fragment or inline into `GET_PRODUCT`.

3. **Six BOGO client-side queries per PDP, all `fetchPolicy: "network-only"`** — explicitly bypasses Apollo cache. Flip to `cache-first`:
   - `app/components/SingleProductPage/FreeGiftPreview.tsx:44,71,83`
   - `app/components/SingleProductPage/ProductDetails.tsx:183,206,218`

4. **FreeGiftPreview and ProductDetails run the same three BOGO hooks independently.** Lift into a shared `useFreeGiftProducts(bogo)` hook so a BOGO PDP drops from 6 round-trips to 3 (or zero, see #12).

### SSR duplication and caching

5. **No `export const revalidate` anywhere.** Homepage, archive, brand, collection, tag pages all fully SSR on every visit. Add `export const revalidate = 300` (homepage) / `3600` (archives/brands) — single highest-leverage change for reducing `/graphql` pressure.

6. **`app/page.tsx` fires 11 parallel WP queries per visit** — with ISR on, this drops from "per visitor" to "per 5 min".

7. **`generateMetadata` and `Page` both call `getData()` independently — 2× GraphQL per page render:**
   - `app/(product)/[brand]/[slug]/page.tsx:100,153` → product detail page
   - `app/(brand-archive)/[brand]/page.tsx:35,73` → brand archive
   - `app/collections/(archive)/[collection]/page.tsx:39,78` → collection archive
   - `app/tag/[tag]/page.tsx:8-22` — also duplicates `GET_TAG_DETAILS_BY_SLUG` with `ArchiveLayout`
   
   Fix: extract a `fetchPageData()` helper that both functions call, and rely on React's per-request cache (use `cache()` from `react`) so the second call is a no-op.

8. **Header fires `GET_ALL_PRODUCTS` (100 cats + 100 brands) + `GET_OPTIONS` per page render** — `app/components/globalComponents/header.tsx:13-27`.
9. **Footer fires separate `GET_BRANDS` per page render** — `app/components/globalComponents/footer.tsx:13-18`.
10. **`ArchiveLayout` fires `GET_ALL_PRODUCTS` unconditionally on every archive page SSR** — `app/components/archive/ArchiveLayout.tsx:11-49`. Header already fetched this data.

    Fix: one SSR fetch at `app/layout.tsx` with `cache()` + long `revalidate`, pass down as props.

11. **SSR Apollo client sets `fetchPolicy: 'no-cache'` globally** — `graphql/apollo-ssr.ts:16,29,33`. Kills same-request dedup. Switch to `cache-first` and combine with Next.js `fetch`-level caching.

### PDP — move BOGO resolution to SSR

12. **Best fix for BOGO on PDP:** in `getData(slug, brand)` at `app/(product)/[brand]/[slug]/page.tsx`, after fetching the main product, inspect `bogoPluginMeta` server-side, do one extra `GET_PRODUCTS_BY_DATABASE_IDS` for the free-gift IDs, pass the result as a prop to `FreeGiftPreview` + `ProductDetails`. Deletes all three client-side hooks (and their duplication). PDP → **zero** client-side GraphQL for BOGO.

---

## Tier 2 — Apollo misuse

13. **Client-side `useQuery(GET_NAV_BRANDS)`** in mega-menu even though header already fetched it via SSR — `app/components/globalComponents/mega-menu/brands.tsx:13`. Pass brands as props.

14. **Client-side `useQuery(GET_NAV_CATEGORIES, first: 1000)`** — `app/components/globalComponents/mega-menu/categories.tsx:21`. Fetches 1,000 categories (only ~100 exist) on every menu mount. Pass from SSR as props.

15. **`useQuery(GET_PRICE_FLUCTUATION_NOTICE)` fires on every PDP mount** — `app/components/SingleProductPage/ProductDetails.tsx:169`. Flag changes at most once a day. Fetch SSR and pass as prop; or `cache-first` with long TTL.

16. **Dead-code `ProductGrid.tsx`** — `app/components/ProductGrid.tsx:25-49` uses `useLazyQuery(GET_BRAND_ARCHIVE)` with a broken `mounts >= 0` guard. Replaced by `ProductGridInstant` but still rendered in some paths. Verify unused and delete.

17. **Apollo dev messages loaded unconditionally** — `graphql/apollo-client.tsx:23-24`. `loadDevMessages()` / `loadErrorMessages()` ship in prod bundles. Gate behind `process.env.NODE_ENV !== 'production'`.

18. **`bogoDatabaseIds` useMemo recomputes per render** — `app/components/ProductGridInstant.tsx:37-44`. `hits` array identity changes every InstantSearch update, so the memo's deps change, new request fires. Consider hashing the ID set to stabilize deps.

---

## Tier 3 — render perf / hooks

19. **ProductDetails has 6 `useEffect` hooks** — `app/components/SingleProductPage/ProductDetails.tsx:65-167`. Several both read and write `activeVariation` (lines 86–116), causing render cascades. Line 167 is `useEffect(() => {}, [attribute])` — no-op, wastes a reconciliation.

20. **`highestPrice` stored in state and computed in effect** — `ProductDetails.tsx:297-319`. Should be `useMemo`. Currently causes a second render after mount.

21. **`ProductCard3` runs `.some()` on `productTags` multiple times per render** — `app/components/ProductCard3.tsx:118-129` (`isPreOrderProduct`, `isClearanceProduct` called at lines 277, 351, 363, 518). Memoize.

22. **Variation price sort in render body** — `ProductCard3.tsx:218-253`. Reduces over up to 50 variations per card per render. Wrap in `useMemo` keyed on `variations`.

23. **`JSON.stringify` in useEffect deps** — `app/components/InstantSearchWrapper.tsx:170`: `useEffect(..., [differedSidebar, tag, JSON.stringify(dealTags || [])])`. Runs every render. Memoize `dealTags` upstream.

24. **1s skeleton delay + setTimeout + setInterval** — `app/components/SectionSliderProductCard.tsx:37-49`, `SectionSliderBrandCard.tsx:41-49`. Data is SSR-hydrated; the artificial delay is pure UX cost.

25. **Context values not memoized** — every consumer re-renders on any change:
    - `context/CartProvider.tsx:341-357` — `CartContext.Provider value={{...}}` inline
    - `context/SessionProvider.tsx:234-237` — same
    - `context/ImageChangeGrabber.tsx:31-36` — same
    
    Wrap in `useMemo`, wrap mutation fns in `useCallback`.

26. **Broad Zustand selectors** — `store/store.ts`. Consumers read the whole `sidebar` slice and re-render on unrelated filter changes. Use granular selectors (`useStore(s => s.sidebar.priceRange)`).

27. **Entire `ProductCard3` (613 lines) is `"use client"`** — `app/components/ProductCard3.tsx:1`. Only the add-to-cart button and hover need client. Split static shell → RSC.

28. **Entire `ProductDetails` (917 lines) is `"use client"`** — same pattern. Name/brand/description block is static.

29. **Checkout pages 1500+ lines of `"use client"`** — `app/checkout/page.tsx:1`, `app/checkout-2/page.tsx:1`. 15+ `useState` per page, no `useReducer`. Lazy-load order summary / address forms / payment UI as separate client components.

---

## Tier 4 — images

30. **`placeholder="blur"` without `blurDataURL`** — `ProductCard3.tsx:406-418`. Silently ignored for dynamic external URLs. Remove or supply a base64 `blurDataURL`.

31. **`.replace("http://", "https://")` in JSX per render** — `ProductCard3.tsx:408-411`. Runs per variation per card per render. Do it at data-fetch time.

32. **All variation images mounted simultaneously** — `ProductCard3.tsx:406-418`. A card with 10 variations fires 10 thumbnail requests immediately even though CSS shows only one. Render just the active variation image.

33. **Product card images lack `sizes` prop** — `ProductCard3.tsx:406,428`. Serves 300px images to mobile where card is ~50vw. Add `sizes="(max-width: 768px) 50vw, 20vw"`.

34. **No `priority` on likely-LCP card** — the first visible card is the LCP candidate. Pass `priority` to the first card in homepage sliders / archive page top row.

35. **`<Image fill>` without `position: relative` parent** — `app/components/NotifyAddTocart.tsx:29`. Layout-broken or invisible.

36. **Product video iframes (TikTok / YouTube) eagerly loaded** — `ProductImage2.tsx:369-386`. Add `loading="lazy"`.

---

## Tier 5 — bundle weight

37. **`framer-motion` imported into 5 client bundles** — `HomePage/SectionHero3.tsx:3`, `LeftSlider.tsx:3`, `MainSlider.tsx:3`, `SectionHero2.tsx:3`, and `SingleProductPage/ProductDetails.tsx:37`. ~40KB gzipped on the critical path of every homepage and every product page. Replace with CSS transitions or `dynamic()` import.

38. **Typesense adapter at module level with `numRetries: 3000, retryIntervalSeconds: 500`** — `app/components/InstantSearchWrapper.tsx:71-91`. A Typesense outage would keep retrying for ~41 hours. Lower `numRetries` to ~3 and `retryIntervalSeconds` to ~2.

39. **`react-icons/pi` in footer for 3 icons** — `app/components/globalComponents/footer.tsx:8`. Inline SVGs would remove a dependency from the footer critical path.

---

## Tier 6 — third-party

40. **Hotjar loaded in `app/layout.tsx:107-122`** — fires on every page including checkout. A commented-out second snippet is also in the file. Decide; remove the other. At minimum, gate by env and exclude checkout.

---

## Execution order

| # | Change | Est. impact | Effort |
|---|---|---|---|
| 1 | Add `revalidate` to homepage + archive/brand/collection/tag pages (#5, #6) | **~80–95% reduction in SSR `/graphql` hits** | 30 min |
| 2 | De-duplicate `generateMetadata` + `Page` `getData()` (#7) | **~50% reduction in per-page queries** | 1 hr |
| 3 | Lift header/footer/archive shared fetches into root layout with `cache()` (#8–#10) | 2–3 req/page saved | 1 hr |
| 4 | Split `ProductContentFull` into card + full fragments (#1, #2) | Cuts per-row WP work on every listing | 2 hr |
| 5 | Switch SSR Apollo to `cache-first` (#11) | Same-request dedup | 15 min |
| 6 | Resolve BOGO free-gift products in PDP SSR, delete client hooks (#12) | Eliminates all PDP-side BOGO `/graphql` | 2 hr |
| 7 | Mega-menu via props, not `useQuery` (#13, #14) | –2 client req / menu open | 1 hr |
| 8 | PDP `fetchPolicy` flips if we keep client-side BOGO (#3) | Within-session dedup | 10 min |
| 9 | Memoize context values (#25) | Large unrelated re-render reduction | 1 hr |
| 10 | Image + bundle fixes (#30–#39) | Smaller bundles, better LCP | Varies |
