# Fork Procedure — spinning up a new tenant

Step-by-step for creating a new tenant storefront (e.g. `petstore-headless`) from
this cleaned-up repo. After the Fork Foundation work, most of this is config/content
swaps — not code surgery. Companion to [`FORK-FOUNDATION-PLAN.md`](./FORK-FOUNDATION-PLAN.md)
(§5) and [`FORK-FOUNDATION-CHECKLIST.md`](./FORK-FOUNDATION-CHECKLIST.md).

---

## 1. Create the new repo

```bash
git clone <gq-headless> petstore-headless && cd petstore-headless
rm -rf .git && git init        # fresh history (or keep history + rename remote)
git remote add origin <new-repo-url>
npm install
```

## 2. Swap `site.config.ts` (the spine)

Every brand-tunable value lives here now. Edit each section for the new tenant:

- `brand` — name, legalName, shortName, tagline, description
- `url` — base, api, cdn, defaultOgImage
- `locale` — countryCode/Name, currencyCode/Symbol, phoneCountryCode, ogLocale
- `contact` — phones, whatsapp, email, storeAddress
- `social` — facebook, instagram, tiktok, googleReviewUrl
- `payment` — gatewayOrder, kokoGatewayId, payhere thresholds, bankAccounts
- `shipping` — free + weight-based method IDs (match the new WC shipping zones)
- `analytics` — googleAnalyticsId
- `product` — defaultWarranty

## 3. Replace `content/*.json` (copy, no code edits)

```
content/faq.json                    content/contact.json
content/testimonials.json           content/brands-page.json
content/store-promo.json            content/checkout-copy.json
content/nav-category-priority.json  ← set to the new store's WC category slugs
```

Also swap brand assets in `public/` (logos, store photos, OG image).

## 4. Theme colors

- Edit `styles/__theme_colors.scss` — the `--c-primary-*` / `--c-secondary-*` /
  `--c-neutral-*` RGB scale — for the new palette.
- In `tailwind.config.ts`: update `primaryColor`, `success`, `danger`.
- **Caveat (deferred work):** the `primary-*` / `secondary-*` scale entries in
  `tailwind.config.ts` are still the buggy quoted-string `'customColors(...)'`
  form, and GQ still has the dual sky/dark-blue split. Do the deferred
  theme-unification *before* forking so a tenant only edits the scale.

## 5. Regenerate the GraphQL layer

Point `NEXT_PUBLIC_WP_GRAPHQL` at the new WC backend, then:

```bash
npm run codegen
```

Adjust `graphql/defs/products.fragments.ts` for the tenant's product-attribute
taxonomies (e.g. drop `allPaCapacity`, add `allPaFlavour` / `allPaWeight`).

## 6. Routes & gateways

- Rename/adjust route dirs if the URL shape differs (e.g. `[brand]/[slug]` →
  `cat/[slug]`) and update `revalidatePath` calls in `app/api/revalidate`.
- Delete GQ-only routes the tenant won't use: `/iphone-16`, `/smartwatches`,
  `/explore-speakers`, and unused gateway API routes (`app/api/genie-*`,
  `koko*`, `ndb-pay`, `payhere`).
- Tenant-only components to rewrite/delete: `ProductSpecifications.tsx`
  (phone-spec schema), `GoogleReviewsSection`, `BankDetails`,
  `data/brandColors.ts`, and the per-design `components/ui/*` pieces.

## 7. Backend (Phase 6 image)

Build the tenant image `FROM gq-org/wp-storefront-base:<ver>`, deploy a fresh
Coolify service with its own MySQL/Redis/uploads volumes, install fresh WP + WC,
and add only the mu-plugins that apply (core baked in; skip GQ-specific ones).

## 8. Search + hosting + env

- New Typesense collection/cluster; set `NEXT_PUBLIC_TYPESENSE_*`.
  **`NEXT_PUBLIC_TYPESENSE_HOST` is required** (the tenant fallback was removed) —
  set it in every Vercel environment or search throws.
- New Vercel project pointed at the new repo; set all env vars
  (`NEXT_PUBLIC_WP_GRAPHQL`, `NEXT_PUBLIC_DOMAIN`, merchant keys, etc.).

## 9. Verify

Run `FORK-FOUNDATION-CHECKLIST.md` end-to-end (lint, build, per-route smoke test)
before launch.

---

## Known rough edges (deferred Fork Foundation work)

A fork **today** still has to deal with these until the deferred items land:

- **Legal pages** (`privacy`, `terms-and-conditions`, `warranty-terms`) are still
  hardcoded JSX (not extracted to `content/legal/*.md`), and still contain the
  `httpbin.org` debug fetches. Edit by hand.
- **Component layout** — files are not yet moved into `components/{layout,primitives,ui}`,
  and root `components/` still mixes with `app/components/`. Finding the per-design
  components to replace is harder than it should be.
- **Theme** — the two-blue split + buggy `customColors` strings (see §4) aren't unified.

Doing these first makes the fork meaningfully cleaner.
