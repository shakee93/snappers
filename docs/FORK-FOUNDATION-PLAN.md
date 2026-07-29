# Fork Foundation Plan

> Internal — do not share. Prepared 2026-05-08.

This doc is the work plan for cleaning up `gq-headless` so it becomes a clean starting point for a future fork (pet-food ecommerce client first; potentially others later). The goal is **internal hygiene**, not multi-tenancy machinery — the repo is the tenant, and a fork creates a new tenant's repo.

The plan is grounded in a two-axis audit (hardcoded values + data-fetching coupling) and a component classification pass. Counts:

- **111** hardcoded findings (28 CONFIG, 32 CONTENT, 8 LIB, 14 ROUTE-DELETE, 12 THEME, 11 TENANT-COMPONENT, 6 LEAVE)
- **22** components that own data fetches and should be extracted into `hooks/`
- **13** tenant-only components to delete on fork
- **12** edge cases / surprises (dead code, duplicates, debug artifacts) — see §6

---

## 1. Goals

1. **Forking creates a clean starting point.** A future tenant clones the cleaned-up repo, swaps a config file, replaces content files, restyles `components/ui/`, runs codegen against their backend, and ships in ~2 weeks.
2. **GQ benefits from the cleanup.** Every PR lands in `main` and improves GQ's structure (kills dead code, fixes the half-finished theme system, untangles data fetching). No work is "for the fork only."
3. **Both repos are maintained separately after fork.** No shared package, no monorepo, no runtime tenancy. Patterns travel via code style and structure, not via shared modules.
4. **Backend is reproducible via Docker images.** A `wp-storefront-base` image bakes WP + WC + WPGraphQL + WooGraphQL + generic mu-plugins; per-tenant images extend the base.

## 2. Architecture

### Frontend layout target

```
gq-headless/                    ← repo IS the tenant
├── site.config.ts              ← brand, base URL, currency, locale, country defaults,
│                                 supported gateway IDs, GA tracking ID, theme token map
├── content/                    ← FAQ.json, testimonials.json, legal.md, about.md,
│                                 hero copy, promotion copy
├── app/globals.css             ← CSS variable values (the theme palette)
├── hooks/                      ← data layer — pure, no UI assumptions
│   ├── useProduct.ts
│   ├── useProductGrid.ts
│   ├── useTypesenseSearch.ts
│   ├── useCart.ts
│   ├── useCheckout.ts
│   ├── useFilters.ts
│   ├── useAuth.ts
│   ├── useMyOrders.ts
│   └── …
├── lib/                        ← pure logic
│   ├── formatPrice.ts
│   ├── bogoCalc.ts
│   ├── cartLinePricing.ts
│   ├── checkoutMath.ts          ← 3% surcharge constant, PayHere thresholds, etc.
│   └── jsonLd/
├── components/
│   ├── layout/                 ← Header, Footer, Cart drawer, MobileBottomNav,
│   │                             modal shell, route-level layouts
│   ├── primitives/             ← ProductGrid mechanics, ArchiveLayout, filter
│   │                             primitives, PDP layout slots, InstantSearchWrapper,
│   │                             pagination, mega-menu shells
│   └── ui/                     ← ProductCard, HomepageHero, PDPSpec, BrandHero,
│                                 TestimonialsSlider, Promo sections, SaleProductCard
│                                 (the per-design components)
├── app/                        ← Next.js routes
└── graphql/defs/               ← regenerated per fork via codegen
```

**Rule of thumb:** if it touches data or business logic, it's in `hooks/` or `lib/`. If it renders markup with brand-specific styling, it's `components/ui/`. If it's pure scaffolding (grid mechanics, focus management, filter primitives), it's `components/layout/` or `components/primitives/`.

### Backend image strategy

```
gq-org/wp-storefront-base:latest         ← shared base (used by every tenant)
  - WordPress + WooCommerce + WPGraphQL + WooGraphQL
  - mu-plugins/core/ baked in:
      graphql-cache-skip-session.php
      graphql-schema-trim.php
      graphql-disable-block-templates.php
      graphql-cache-public-users.php
      graphql-cache-nav-categories.php
      stock-manager-disable-init-dbdelta.php
      postmeta-stock-cache-race-fix.php
      backend-noindex.php
      tripwire.php (with empty allowlist)
  - PHP 8.3 + JIT, OPcache validate_timestamps=0
  - Standard Apache/PHP-FPM tuning

gq-org/wp-gq:latest                      ← GQ-specific layer
  FROM gq-org/wp-storefront-base:latest
  COPY mu-plugins/gq/ → /var/www/html/wp-content/mu-plugins/
  COPY plugins/p0-connect/ → /var/www/html/wp-content/plugins/
  COPY plugins/wc-bogo-simple/ → /var/www/html/wp-content/plugins/

gq-org/wp-petstore:latest                ← pet-store layer (built when ready)
  FROM gq-org/wp-storefront-base:latest
  # only what pet-store needs — likely just core, possibly wc-bogo-simple
```

`gq-backend-plugins` repo becomes the **build context** for these images, not the deployment artifact. `bin/deploy.sh` becomes `bin/build.sh && docker push`. Each tenant's Coolify service pulls their own image, sets env vars, mounts their own MySQL/Redis/uploads volumes. Updates flow by rebuilding tenant images on a new base tag.

## 3. Phased work plan

Each phase is one or more PRs into `main`. CLAUDE.md rules apply (branch off main, conventional commits, human review, no direct pushes).

### Phase 0 — Audit (DONE, 2026-05-08)

Output: this doc. Inventory of all 111 hardcoded values, 22 hook-extraction candidates, 93-component classification, 12 edge cases.

### Phase 1 — `site.config.ts` + `content/` foundation (~2 days)

**Branch:** `chore/site-config-foundation`

Establishes the configuration spine. Everything tenant-specific eventually points here.

#### `site.config.ts` schema

```ts
export const siteConfig = {
  brand: {
    name: "GQ Mobiles",
    legalName: "GQ Mobiles (Pvt) Ltd",
    shortName: "GQ",
    tagline: "Best mobile phones in the market",
  },
  url: {
    base: "https://gqmobiles.lk",
    api: "https://api.gqmobiles.lk",
    cdn: "https://cdn.gqmobiles.lk",
    defaultOgImage: "https://cdn.gqmobiles.lk/wp-content/uploads/2025/10/gq.png",
  },
  locale: {
    countryCode: "LK",
    countryName: "Sri Lanka",
    currencyCode: "LKR",
    currencySymbol: "Rs",
    phoneCountryCode: "+94",
  },
  contact: {
    primaryPhone: "0777555665",
    secondaryPhone: "0777988665",
    email: "Inquires@gqmobiles.lk",
    storeAddress: "No. 250 | 53–54 Ground Floor, Liberty Plaza, Colombo 03",
  },
  social: {
    facebook: "gqmobilestore",
    instagram: "gqthemobilestoreunlimited",
    tiktok: "@gqmobiles",
  },
  payment: {
    gatewayOrder: ["payhere", "ndb-pay", "cod", "darazbnpl", "bacs"],
    payhere: {
      hideAboveAmount: 100000,
    },
  },
  shipping: {
    freeShippingMethodId: "wbs:5c9bd062_free_shipping",
  },
  analytics: {
    googleAnalyticsId: "G-LS3EVR93ZH",
  },
} as const;
```

#### `content/` directory

Plain JSON / Markdown files, no abstraction layer:

```
content/
├── faq.json                     ← Q&A array currently hardcoded in FAQSection.tsx
├── testimonials.json            ← review array currently in TestimonialsSlider.tsx
├── legal/
│   ├── privacy.md
│   ├── terms.md
│   └── warranty.md
├── about.md                     ← about page body copy
├── hero-promo.json              ← TopBarPromotion default copy
└── nav-category-priority.json   ← currently lib/collectionNavOrder.ts data half
```

#### Specific replacements landed in this phase

From the CONFIG bucket (28 findings):
- `app/layout.tsx:18-67` — title template, descriptions, OG metadata, GA script
- `app/sitemap-helpers.ts:6`, `app/(chromed)/(sitemaps)/s/collections/sitemap.ts:6`, `app/components/SingleProductPage/ShareButtons.tsx:8` — three `BASE_URL` consts collapse to `siteConfig.url.base`
- `app/(chromed)/(product)/[brand]/[slug]/page.tsx:71,100,578` — DEFAULT_OG_IMAGE, canonical URL, share URL
- `app/(chromed)/(brand-archive)/[brand]/page.tsx:45,47`, `app/(chromed)/collections/(archive)/[collection]/page.tsx:49,52` — canonical and OG references
- `app/robots.ts:10` — sitemap URL
- `tailwind.config.ts:43` — `primaryColor: '#1b40af'` (deferred to Phase 5 if it requires touching the theme more broadly)
- `context/PaymentProvider.tsx:22,37` — gateway order array, koko gateway ID check
- `app/(chromed)/checkout/page.tsx:546,233,664` — currency, shipping method ID
- `app/components/Payment/Payhere.tsx:54,61` — currency, country
- `app/components/InstantSearchWrapper.tsx:66` — Typesense host fallback (drop fallback entirely; require env var)
- `next.config.js` `remotePatterns` — derive from `siteConfig.url.cdn`
- `app/(chromed)/checkout/CheckoutHeader.tsx:7-8` — support phone constants
- `app/components/GoogleAnalytics.tsx:12` and `app/layout.tsx:67,75` — GA ID consolidated to one place

From the CONTENT bucket (32 findings):
- `app/components/HomePage/FAQSection.tsx:9-120` → `content/faq.json`
- `app/components/TestimonialsSlider.tsx:31-68` → `content/testimonials.json` (kill the `fallBacktestimonials` + use prop with content fallback)
- `app/(chromed)/privacy/page.tsx:52-340` → `content/legal/privacy.md` (rendered via `react-markdown` or similar)
- `app/(chromed)/terms-and-conditions/page.tsx:26-413` → `content/legal/terms.md`
- `app/(chromed)/warranty-terms/page.tsx` body → `content/legal/warranty.md`
- `app/(chromed)/about/page.tsx:15-79,133` → `content/about.md` + testimonial JSON
- `app/components/HomePage/SectionPromo1.tsx:37,39` → `content/about.md` reuse or content/store-promo.json
- `app/(chromed)/brands/page.tsx:32` — hero description → content/brands-page.json
- `app/(chromed)/deals/page.tsx:12` — meta description → derived from `siteConfig.brand.name`
- `app/(chromed)/contact/page.tsx:122-222` — store address, phone numbers from `siteConfig.contact`
- `app/(chromed)/checkout/UnifiedCheckoutForm.tsx:850,864,1003,688` — pickup chip labels, "Visit GQ Mobiles" copy → content/checkout-copy.json
- `app/(chromed)/checkout/CheckoutFooter.tsx:28` — copyright derived from `siteConfig.brand.legalName`
- `app/(chromed)/thank-you/page.tsx:157` — "GQ Mobile" heading → `siteConfig.brand.name`
- `app/components/HomePage/GoogleReviewsSection.tsx:5` — Google Maps deep-link → tenant-specific, move to `site.config.ts` or delete component on fork

**Definition of done for Phase 1:** grep `gqmobiles\|GQ Mobiles\|GQ\s\|0777\|Sri Lanka\|Liberty Plaza\|Colombo` over `app/` `components/` `containers/` `shared/` `lib/` returns hits **only** in `site.config.ts`, `content/**`, and `data/brandColors.ts` (which is handled in a later phase).

### Phase 2 — Lib lifts and currency formatting (~1 day)

**Branch:** `chore/lib-extractions`

The 8 LIB findings, plus a few helpers that should exist:

- `lib/formatPrice.ts` — `formatPrice(amount: number)` reads `siteConfig.locale.currencySymbol` + `currencyCode`. Replaces inline `Rs ${new Intl.NumberFormat...}` at `app/(chromed)/checkout/page.tsx:888-889` and `UnifiedCheckoutForm.tsx:283`. Also kills `LKR`/`Rs.` literals in `PriceFilter.tsx`, `MobileFilterSheet.tsx`, `OrderItem.tsx`.
- `lib/checkoutMath.ts` — exports `PAYHERE_HIDE_THRESHOLD` (currently `100000`). Reads from `siteConfig.payment.payhere.hideAboveAmount`. (`CARD_SURCHARGE_RATE` was removed — the site no longer applies a frontend surcharge; pricing comes from WooCommerce fees / woo-price-tiers.)
- `lib/api.ts` — `apiUrl(path: string)` helper that joins `siteConfig.url.api` + path. Replaces hardcoded `https://api.gqmobiles.lk/wp-json/...` URLs in `OrderBankReceiptUpload.tsx:44`, `Payment/BankTransfer.tsx:114`, `checkout/page.tsx:1089`, `app/(chromed)/contact/page.tsx:56`.
- `lib/jsonld/productSchema.ts:39,46,15-18` — `priceCurrency`, seller `name`, `DEFAULT_WARRANTY` from `siteConfig`.
- `lib/collectionNavOrder.ts:5-16` — split: data array → `content/nav-category-priority.json`; ordering helpers stay in `lib/`.
- `data/brandColors.ts` — flag for fork-time replacement; in GQ's repo, leave as-is. This is GQ catalog data, not lib code, but doesn't hurt to keep until fork.

**Definition of done for Phase 2:** no inline currency formatter, no hardcoded API URLs in components, no inline magic numbers for payment thresholds.

### Phase 3 — Extract data hooks (~3–4 days)

**Branches (one per domain, parallel-merging):** `refactor/hooks-product`, `refactor/hooks-cart-checkout`, `refactor/hooks-account`, `refactor/hooks-nav-search`

Per the audit: 22 EXTRACT candidates, 18 KEEP (already in correct location — context providers, server-component fetches). Order by safety (low risk first):

#### 3a. Product / PDP hooks (low risk)

- `useFreeGiftProducts(productId)` ← from `ProductDetails.tsx:195` and `FreeGiftPreview.tsx:39` (deduplicates two callers of the same query)
- `useProductById(databaseId, variationId?)` ← from `ProductDetails.tsx:220,229` and `FreeGiftPreview.tsx:68,77`
- `useTechSpec(databaseId)` ← from `ProductQuickView3.tsx:67`
- `useQuickViewProduct(databaseId)` ← from `ModalQuickView.tsx:27`
- `useBogoPluginMeta(productIds)` ← from `ProductGridInstant.tsx:46`
- `useBrandArchive(slug)` ← from `ProductGrid.tsx:21`
- `usePriceFluctuationNotice()` ← from `ProductDetails.tsx:173` and `CheckoutDetails.tsx:49` (deduplicates)

#### 3b. Cart / Checkout hooks (medium risk — checkout is sensitive)

- `useCoupon()` ← from `checkout/page.tsx:104,105` (`APPLY_COUPON`, `REMOVE_COUPONS`)
- `useShipping()` ← from `checkout/page.tsx:143` (`UPDATE_SHIPPING_TOTAL`)
- `useCheckout()` ← from `checkout/page.tsx:151,153,158,165` (4 mutations: checkout, guest, order, order-payment)
- `useCheckoutUserDetails()` ← from `CheckoutDetails.tsx:48`
- Cart context unification — `context/SessionProvider.tsx:56` duplicates `GET_CART` from `CartProvider.tsx:97`. Pick one, kill the other.

**Caveat:** the gateway if/else logic in `checkout/page.tsx` (PayHere/Genie/Koko/NDB/bank) **stays as-is**. We are not refactoring the gateway adapter pattern in this phase. Pet-store will likely use the same gateways, so the abstraction has zero payoff for two tenants. Defer until a third tenant uses different gateways.

#### 3c. Account hooks (low risk)

- `useMyOrders()` ← from `app/(chromed)/account/my-orders/page.tsx:12`
- `useOrderById(id)` ← from `app/(chromed)/thank-you/page.tsx:17`
- `useResetPassword()` ← from `app/(chromed)/reset-password/page.tsx:23`
- `useForgotPassword()` ← from `app/(chromed)/forgot-pass/page.tsx:17`

#### 3d. Nav / Homepage hooks (low risk)

- `useNavBrands()` ← from `mega-menu/brands.tsx:13`
- `useBrands()` ← from `SectionGridMoreExplore.tsx:129`
- `useSlides()` ← from `SectionHero.tsx:68`

#### Things explicitly NOT extracted

- `context/CartProvider.tsx` cart queries/mutations — already in the right place
- `context/SessionProvider.tsx` auth queries/mutations — already in the right place
- `context/PaymentProvider.tsx` gateway query — already in the right place
- `context/SearchProvider.tsx` — already in the right place
- All server-component `getClient().query(...)` calls in `page.tsx`/`layout.tsx`/server-only components — these are SSR fetches, KEEP
- `app/(chromed)/checkout/page.tsx:944,980` `fetch("/api/koko")`, `fetch("/api/ndb-pay")` — API route boundary calls; could optionally extract to `useKokoPayment()` / `useNdbPayment()` but low value (one caller each)

**Definition of done for Phase 3:** every `useQuery` / `useMutation` invocation in the codebase is either inside `hooks/`, inside a `context/*Provider.tsx` provider, or inside a server-component `page.tsx`/`layout.tsx`. Page client components and presentation components contain no GraphQL calls.

### Phase 4 — Component reorganization (~2–3 days)

**Branch:** `chore/components-reorg`

Move files into `components/layout/`, `components/primitives/`, `components/ui/`. Per the classification: 12 LAYOUT, 30 PRIMITIVE, 38 UI, 13 TENANT-ONLY.

This phase is mostly directory moves with import-path updates. The risk is in import churn, not logic changes. Approach:

1. Do moves in the order: LAYOUT → PRIMITIVE → UI → TENANT-ONLY (deletions). Keep PRs small (one category per PR).
2. Update import paths via codemod (`grep -r "from '@/components/SomeFile'" | xargs sed`). TypeScript compilation catches the rest.
3. The root `components/` directory (legacy Ciseco scaffold per §6 finding 6) gets pruned: imports audit reveals what's dead, dead files get deleted, surviving files move to `components/{layout,primitives,ui}/`.
4. `app/components/` gets folded into the new structure. Eventually only `app/` route files remain in `app/`.

#### Tenant-only components — delete or keep until fork?

**Delete now (in GQ's repo):** files where the entire purpose is dead / GQ-internal-debug:
- `app/(chromed)/test/page.tsx`
- `app/(chromed)/thank-you/page2.tsx`
- `app/(chromed)/terms-and-conditions/SectionFounder.tsx`, `SectionHero.tsx`, `SectionStatistic.tsx` (orphaned scaffold per §6 finding 6 — verify no imports first)
- `httpbin.org` debug fetches at `app/(chromed)/privacy/page.tsx:12` and `app/(chromed)/warranty-terms/page.tsx:8` (§6 finding 1)
- Dead imports in `ProductCard3.tsx:32-33` (§6 finding 5)
- `app/api/banktransfer/route.ts:1` legacy bare-IP URL (§6 finding 3)

**Keep in GQ's repo (mark as TENANT-ONLY for the fork):** files that GQ needs but pet-store will delete:
- `components/TikTokSection.tsx` (the active one in `app/components/` if separate)
- `app/components/Payment/BankDetails.tsx`
- `app/components/HomePage/GoogleReviewsSection.tsx`
- `app/(chromed)/iphone-16/`, `/smartwatches/`, `/explore-speakers/` route directories
- `app/api/genie-*`, `app/api/koko*`, `app/api/ndb-pay`, `app/api/payhere` directories (pet-store may not use these gateways)

**Definition of done for Phase 4:** every file under `components/`, `app/components/`, or `containers/` lives in exactly one of `{layout,primitives,ui}/` and the role of each is obvious from its location.

### Phase 5 — Theme tokens end-to-end (~1 day)

**Branch:** `style/theme-tokens-complete`

The CSS-variable system is half-finished. The 12 THEME findings show why: some components reference CSS vars (`var(--c-primary-500)`), others use `bg-[#1B40AF]` literals for the same color, and `tailwind.config.ts:43` has `primaryColor: '#1b40af'` as a hardcoded property. A fork inheriting this state has to find-and-replace all three patterns.

#### Work

1. Define the full CSS variable scale in `app/globals.css`:
   ```css
   :root {
     --c-primary-50: ...;
     --c-primary-100: ...;
     ...
     --c-primary-900: ...;
     --c-secondary-...: ...;
     --c-accent-...: ...;
     --c-success: ...;
     --c-danger: ...;
   }
   ```
2. Remove `primaryColor: '#1b40af'` from `tailwind.config.ts:43`. All Tailwind color classes derive from CSS variables already.
3. Replace `bg-[#1B40AF]` / `text-[#1B40AF]` / `border-[#1B40AF]` (all variations) with `bg-primary-500` / `text-primary-500` / `border-primary-500`. Affected: `SaleProductCard.tsx:62,69,74`, `TestimonialsSlider.tsx:195`, `NavigationEvents.tsx:66`.
4. Replace `bg-[#cecfd0]` / `bg-[#9e9fa0]` carousel grays with neutral CSS vars. Affected: `SectionSliderBrandCard.tsx:159-160`, `TestimonialsSlider.tsx:183-184`, `SectionSliderProductCard.tsx:169-170`.
5. Replace `text-[#059669]` with `text-success`. Affected: `checkout/page.tsx:1384`.
6. Replace `bg-[#CCE0EF]` with a primary-50 derivative. Affected: `SectionHero.tsx:186`.
7. Replace `text-[#D71E1E]` strikethrough red with a `--c-danger` reference. Affected: `SaleProductCard.tsx:58`.
8. Fix `app/globals.css:40,47` scrollbar `background: red` / `#b30000` (looks like dev leftover; replace with sane defaults).

#### Things to LEAVE as hex literals

Third-party brand colors are not theme tokens:
- Facebook blue `#1877f2` (`ShareButtons.tsx:64`)
- WhatsApp green `#25d366` (`ShareButtons.tsx:82`, `CheckoutHeader.tsx:45`, `WhatsAppLogo.tsx:62`)
- Decorative SVG fills in `ContactBg.tsx` (cosmetic only — could move to vars but low payoff)

**Definition of done for Phase 5:** grep `'\#[0-9a-fA-F]\{3,8\}'` over `app/`, `components/`, `containers/`, `shared/` returns hits only in (a) `app/globals.css`, (b) third-party brand color references with explanatory comments, (c) `tailwind.config.ts` only if it's referencing CSS vars. No `bg-[#...]` Tailwind escapes for tenant-themed colors.

### Phase 6 — Backend mu-plugin reorg + Docker base image (~1.5 days)

**Branch:** `chore/mu-plugin-split` in `gq-backend-plugins`

#### Reorganize `mu-plugins/`

```
gq-backend-plugins/
├── mu-plugins/
│   ├── core/                                    ← baked into base image
│   │   ├── graphql-cache-skip-session.php
│   │   ├── graphql-schema-trim.php
│   │   ├── graphql-disable-block-templates.php
│   │   ├── graphql-cache-public-users.php
│   │   ├── graphql-cache-nav-categories.php
│   │   ├── stock-manager-disable-init-dbdelta.php
│   │   ├── postmeta-stock-cache-race-fix.php
│   │   ├── backend-noindex.php
│   │   └── tripwire.php (allowlist parametrized)
│   └── gq/                                      ← GQ-specific layer only
│       ├── pos-rest-logger.php
│       ├── pos-rest-strip-prices.php
│       └── auth-audit.php
├── plugins/
│   ├── p0-connect/                              ← GQ only
│   └── wc-bogo-simple/                          ← GQ only (pet-store may opt in)
├── docker/
│   ├── base/Dockerfile                          ← FROM wordpress:php8.3 + core/
│   └── gq/Dockerfile                            ← FROM base + gq/ + plugins/
└── bin/
    ├── build.sh                                 ← docker build + push
    ├── deploy.sh                                ← (legacy; keep for emergencies)
    └── diff.sh
```

`tripwire.php` allowlist becomes a constant defined at the top of the file, populated per-image at build time (or just listed all generic mu-plugin filenames in the base, and per-tenant filenames added in the tenant Dockerfile via a `sed` step or a sidecar config).

#### Docker images

- `gq-org/wp-storefront-base:<version>` — built from `docker/base/Dockerfile`. CI builds and pushes on tag.
- `gq-org/wp-gq:<version>` — built from `docker/gq/Dockerfile`, `FROM gq-org/wp-storefront-base:<version>`.
- Each tenant gets their own Dockerfile in their own backend repo / directory, all `FROM gq-org/wp-storefront-base:<version>`.

#### Coolify integration

Each tenant's Coolify service is configured to:
- Pull the tenant image (e.g. `gq-org/wp-gq:latest`)
- Mount tenant-specific volumes for MySQL data, Redis data, `wp-content/uploads/`
- Set tenant-specific env vars (`WP_HOME`, DB creds, Redis auth, Typesense API key)

The compose file in Coolify becomes much simpler — just `image:` + volumes + env, no in-place file copies.

**Definition of done for Phase 6:** `gq-org/wp-storefront-base` image builds cleanly, GQ runs against the tenant-extended image without functional regression, and a "spin up a fresh tenant backend" runbook exists.

## 4. Sequencing and timing

```
Week 1
  Day 1     Phase 1 starts (site.config.ts + content/)
  Day 2     Phase 1 continues
  Day 3     Phase 2 (lib lifts)
  Day 4     Phase 5 starts in parallel (theme tokens) — independent of Phase 3
  Day 5     Phase 3 starts (hooks 3a + 3d — low risk first)

Week 2
  Day 6-7   Phase 3 continues (3c account, 3b cart/checkout — sensitive)
  Day 8     Phase 4 starts (component reorg — LAYOUT first)
  Day 9     Phase 4 continues (PRIMITIVE → UI → TENANT-ONLY deletions)
  Day 10    Phase 6 (backend Docker base image)

Week 3
  Buffer for review cycles, integration testing, Vercel staging verification.
  After merge: tag a "fork-ready" release of gq-headless. Begin pet-store fork.
```

**Total: ~10 working days of cleanup + 1 week of buffer/review = 3 weeks calendar.**

Phases 1, 2, 5, 6 can run in parallel after Phase 1 lands (different files, no conflicts). Phase 3 must follow Phase 2 (hooks read from `lib/` constants). Phase 4 must follow Phase 3 (so hook locations are stable when files move).

## 5. Fork procedure (post-cleanup, for pet-store and future tenants)

```
1. Clone gq-headless → petstore-headless (separate GitHub repo).
2. Edit site.config.ts → pet brand, base URL, currency, locale, gateway IDs, GA ID.
3. Replace content/ files → pet FAQ, pet testimonials, pet legal copy, pet about.
4. Edit app/globals.css → swap CSS variable values for pet color palette.
5. Replace components/ui/* per designer's components.
   - Most likely targets: ProductCard, HomepageHero, SectionPromo*, BrandHero,
     SaleProductCard, TestimonialsSlider visual layer (data already in JSON).
6. Run codegen against pet WC backend → regenerated graphql/types/.
   Update graphql/defs/products.fragments.ts for pet PA taxonomies (drop allPaCapacity,
   allPaWatchSize etc.; add allPaWeight, allPaFlavour, allPaAgeGroup, allPaBreedSize).
7. Adjust route directories:
   - rename app/(chromed)/(product)/[brand]/[slug] → app/(chromed)/(product)/cat/[slug]
     (or whatever URL structure pet-store wants)
   - delete /iphone-16, /smartwatches, /explore-speakers
   - delete app/api/genie-*, koko*, ndb-pay (if pet uses different gateways)
   - update revalidatePath calls in api/revalidate to match the new route shape
8. Backend: build petstore Dockerfile FROM wp-storefront-base, deploy fresh
   Coolify service, install WP+WC fresh, install only the mu-plugins that apply
   (core/ already baked in; skip gq/, p0-connect, possibly wc-bogo-simple).
9. New Typesense cluster (or shared cluster with separate collection).
10. New Vercel project pointed at the new repo and backend.
```

**Expected fork-to-launch time:** 2–3 weeks (dominated by visual work against the new design, not by structural rework).

## 6. Edge cases and dead code (from audit §5)

These are findings outside the main inventory. Address opportunistically; flag in PR descriptions when you encounter them:

1. **`httpbin.org` debug fetches in production** — `app/(chromed)/privacy/page.tsx:12` and `app/(chromed)/warranty-terms/page.tsx:8` call `fetch("https://httpbin.org/delay/3", { cache: "force-cache" })`. The result is unused; this adds 3s latency on first render and breaks in offline/CI environments. **Delete in Phase 4.**

2. **`BASE_URL` defined in three files** — `app/sitemap-helpers.ts:6`, `app/(chromed)/(sitemaps)/s/collections/sitemap.ts:6`, `app/components/SingleProductPage/ShareButtons.tsx:8`. Consolidate to `siteConfig.url.base` in **Phase 1**.

3. **`app/api/banktransfer/route.ts:1` bare IP URL** — `const apiUrl = "http://52.45.14.64/wp-json/…"` points at an old WordPress server. Other routes use `https://api.gqmobiles.lk`. Likely dead code or half-migrated. **Verify and fix in Phase 2** (move to `apiUrl()` helper).

4. **`thank-you/page2.tsx` orphaned** — Second implementation of the order success page. No route renders it; `page.tsx` wins. **Delete in Phase 4.**

5. **`ProductCard3.tsx:32-33` dead imports** — `useQuery` and `GET_QUICK_VIEW_PRODUCT` imported but never invoked. The hook execution moved to `ModalQuickView.tsx`. **Delete in Phase 4.**

6. **Root `components/` vs `app/components/` duplicates** — Root `components/` contains legacy Ciseco scaffold copies (`SectionPromo1`, `SectionPromo2`, `SectionPromo3`, `SectionHero/SectionHero2`, `SectionHero/SectionHero3`, `SectionHowItWork`, `SectionSubscribe2`, `TikTokSection`, others). Active code lives in `app/components/`. **Audit imports during Phase 4 reorg; delete unimported files; move imported survivors into the new structure.**

7. **`CategoryWithSubcategories.tsx` slugs are wrong** — Hardcoded slugs (`/collections/smart-phones`, `/mobile-accessories/cases`) don't match live WC taxonomy (`/collections/mobiles-and-tablets` etc. used elsewhere). These links are likely 404 in production. The whole component is TENANT-ONLY data; the data block becomes content config or gets driven from CMS. **Fix in Phase 1 (CONTENT migration) or accept and delete on fork.**

8. **`checkout/page.tsx:114` TODO** — `// TODO: Uncomment this for the redirect on cart free`. Incomplete feature. **Decide pre-fork: ship it or remove the TODO.** Not blocking.

9. **GA tracking ID hardcoded twice with double-fire risk** — `app/layout.tsx:67,75` `<Script>` and `app/components/GoogleAnalytics.tsx:12` constant. Both load GA. Verify in DevTools whether `gtag` fires twice; consolidate. **Fix in Phase 1.**

10. **`lib/collectionNavOrder.ts` is config dressed as lib** — The `COLLECTION_NAV_PRIORITY_SLUG_GROUPS` array is GQ-specific data. Helpers (`orderCollectionNavRoots`, `orderCollectionNavForDropdown`) are reusable. **Split in Phase 2.**

11. **`data/brandColors.ts` is GQ catalog data** — 50-entry brand→color lookup of mobile/electronics brands. Pet-food fork has zero overlap. **Leave in GQ's repo; fork-time replacement.**

12. **`ProductSpecifications.tsx` assumes phone schema** — Renders Kimovil/phone-comparison fields (`usb_type`, `sim_slot`, `operating_system`) from a `tech_spec_data` WP meta key. **Mark TENANT-ONLY; pet-store deletes and writes a pet-spec component.**

## 7. Things explicitly NOT in this plan

To prevent scope creep:

- **No payment gateway adapter pattern.** PayHere/Genie/Koko/NDB inlined as if/else stays. Pet-store will likely use the same gateways. Refactor when a third tenant wants different ones.
- **No generic spec renderer.** Pet-spec and phone-spec are different schemas. Pet-store deletes `ProductSpecifications.tsx` and writes their own. No shared abstraction.
- **No GraphQL fragment refactor.** Codegen regenerates per backend. Pet-store runs codegen against their pet WC backend; gets pet PA taxonomies, done.
- **No URL structure abstraction.** `/[brand]/[slug]` vs `/cat/[slug]` is a meaningful divergence. Pet-store renames the route directory; the page component logic copies 95% as-is.
- **No checkout flow refactor.** Highest-risk surface; touching it adds delay with no guaranteed payoff. Phase 3 extracts hooks but leaves the gateway selection logic intact.
- **No monorepo, no shared packages.** Two separately-maintained repos. Patterns travel via documentation (this doc) and code style.
- **No multi-tenancy machinery.** No `tenant/` directory, no per-tenant indirection. The repo is the tenant.
- **No internationalization library.** The locale config is enough for now; if a future tenant needs multi-locale within one site, plan that separately.
- **No CMS for content.** `content/*.json` and `content/*.md` files in the repo. If CMS is needed later, plan separately.

## 8. Risks

1. **Phase 3 (hooks) on checkout is sensitive.** Use a real PayHere sandbox order + real Genie sandbox order as smoke tests before merging `useCheckout()` extraction. Keep the gateway selection if/else intact.
2. **Phase 4 import churn is mechanical but risky.** TypeScript catches most issues; build verification + manual smoke test of every major route (homepage, PDP, archive, search, cart, checkout, account, auth) is required before merge.
3. **`tripwire.php` allowlist regression in Phase 6.** When the mu-plugin reorg happens, the tripwire allowlist must update or every backend request spams error_log. Verify in staging.
4. **Vercel SSR cache invalidation during Phase 5.** Theme changes don't affect cached HTML, but if any component's class names change in ways that affect serialized output, edge cache may serve stale CSS classes. Vercel ISR rebuild handles it, but plan a manual revalidation pass after merge.
5. **Codegen breaks on fork** if the pet backend has different PA taxonomies than the fragment expects. Pet-store team must run codegen first thing on fork; the cleanup doc should call this out.
6. **The audit may have missed things.** 111 findings is large but not exhaustive — copy hidden in long JSX strings, third-party SDK config buried in env, pixel-tracking IDs we didn't search for. The grep-able definitions of done in each phase are the safety net.

## 9. Definition of done for the cleanup as a whole

A pet-store engineer (or any new fork engineer) can:

1. Open `site.config.ts` and see every brand-tunable value in one place.
2. Open `content/` and replace copy without touching code.
3. Open `app/globals.css` and swap colors without touching components.
4. Run `grep "GQ\|gqmobiles\|Sri Lanka\|LKR\|Rs\." -r app/ components/ containers/ shared/ lib/` and see hits **only** in `site.config.ts`, `content/`, `data/brandColors.ts`, and ROUTE-DELETE files marked for deletion.
5. Run codegen against a different WC backend and the typed query layer regenerates without code changes.
6. Read `components/ui/` filenames and immediately know which components need design replacement.
7. Read `hooks/` filenames and immediately know what data is available.
8. Build a tenant Dockerfile `FROM gq-org/wp-storefront-base:latest` and have a working WP + WC + WPGraphQL backend with all generic perf optimizations baked in.

When all eight of those are true, the cleanup is done. Tag a release. Begin the pet-store fork.

---

## Appendix A — Audit raw counts

| Axis | Total | Breakdown |
|---|---|---|
| Hardcoded values | 111 | 28 CONFIG · 32 CONTENT · 8 LIB · 14 ROUTE-DELETE · 12 THEME · 11 TENANT-COMPONENT · 6 LEAVE |
| Data fetches in components | 40 | 22 EXTRACT · 18 KEEP · 0 MOVE-TO-SERVER |
| Components classified | 93 | 12 LAYOUT · 30 PRIMITIVE · 38 UI · 13 TENANT-ONLY |
| Edge cases / surprises | 12 | dead code, duplicates, debug artifacts |

## Appendix B — Hooks to be created (full list)

Product domain: `useFreeGiftProducts`, `useProductById`, `useTechSpec`, `useQuickViewProduct`, `useBogoPluginMeta`, `useBrandArchive`, `usePriceFluctuationNotice` (7)

Cart/Checkout domain: `useCoupon`, `useShipping`, `useCheckout`, `useCheckoutUserDetails` (4)

Account domain: `useMyOrders`, `useOrderById`, `useResetPassword`, `useForgotPassword` (4)

Nav/Homepage domain: `useNavBrands`, `useBrands`, `useSlides` (3)

**Total new hooks: 18.** (The audit lists 22 EXTRACT candidates; 4 of those are duplicate callers of the same query that consolidate into one hook — see `useFreeGiftProducts`, `useProductById`, `usePriceFluctuationNotice`.)
