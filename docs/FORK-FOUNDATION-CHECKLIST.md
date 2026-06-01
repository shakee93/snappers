# Fork Foundation — Verification Checklist

Companion to [`FORK-FOUNDATION-PLAN.md`](./FORK-FOUNDATION-PLAN.md). Use this to confirm
each phase ships without breaking the GQ storefront. Tick every box in the active
phase before opening/merging its work.

---

## How to run & verify

```bash
# from the worktree/repo root
npm run dev        # http://localhost:3000 — primary way to verify visually
npm run lint       # must be 0 errors (pre-existing warnings are OK)
npm run build      # compiles must pass; see note below
```

> **Build note:** `next build` runs SSG against the **live** WordPress/WooCommerce
> backend. Under the prerender burst the backend can return **HTTP 429
> (rate-limited)**, which fails the *static-generation* step even though the code
> compiled cleanly. Treat **`✓ Compiled successfully`** + **0 type errors** as the
> pass signal for code correctness. A clean full build requires retrying when the
> backend isn't throttling.

> **Worktree note:** git worktrees don't get their own `node_modules`. If a build
> fails with `Can't find stylesheet to import … @glidejs/glide`, symlink the
> parent's modules: `ln -s ../../../node_modules node_modules` (gitignored).

---

## Pre-merge checklist (every phase)

- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → `✓ Compiled successfully`, 0 type errors (429 SSG failures excepted)
- [ ] No new `console.log` / dead code / unused imports introduced
- [ ] Smoke-tested the routes for the phase (below) in `npm run dev`
- [ ] PR description lists any deferred items and decisions made

---

## Per-route smoke test (run after any phase)

- [ ] **Homepage** `/` — hero, sliders, FAQ, testimonials, store-promo, Google-reviews button, footer
- [ ] **PDP** `/<brand>/<slug>` — gallery, price, add-to-cart, free-gift, share/WhatsApp buttons
- [ ] **Brand archive** `/<brand>` — grid, filters, pagination
- [ ] **Collection** `/collections/<slug>` and `/collections/all`
- [ ] **Search** — Typesense results, filters, sort
- [ ] **Cart** — add/remove/update qty
- [ ] **Checkout** `/checkout` — header/footer, currency, delivery options, coupon, each gateway visible
- [ ] **Account/auth** — login, my-orders, reset/forgot password
- [ ] **Contact** `/contact` — locations, phones, email, form submit

---

## Phase 1 — `site.config.ts` + `content/`  ✅ verified locally

- [x] `site.config.ts` created and pre-filled with GQ's real values (no action needed for GQ)
- [x] `content/` JSON files created (faq, testimonials, contact, brands-page, store-promo, checkout-copy)
- [x] `next.config.ts` replaces `next.config.js`; image hosts derived from `siteConfig`
- [x] Metadata / OG / GA wired to `siteConfig` (GA double-fire fixed)
- [x] Payment gateway order, koko id, Payhere, checkout currency + shipping IDs wired
- [x] FAQ, testimonials, contact page render from `content/`
- [x] `npm run lint` 0 errors · `✓ Compiled successfully` · app verified in browser

**Open decisions (still need an answer):**
- [ ] Canonical **phone-to-branch** mapping — footer's set vs contact page's set (they differ)
- [ ] Canonical **Instagram** handle — `gqthemobilestoreunlimited` (current) vs `gqthemobilestore`

**Ops:**
- [ ] Confirm `NEXT_PUBLIC_TYPESENSE_HOST` is set in **Vercel (all environments)** — the
      tenant fallback was removed, so it is now required.

---

## Legal documents — EXCLUDED by request (still TODO) ⚠️

The privacy, terms, and warranty pages were **intentionally left untouched** during
Phase 1 (you asked to exclude legal files). They are still plain JSX and still contain
hardcoded brand tokens, so they are the **known exception** to the Phase 1 grep
definition-of-done. To finish the fork foundation for legal content, do the following
(with a human review of the copy — the extraction is mechanical but the content is sensitive):

- [ ] Extract `app/(chromed)/privacy/page.tsx` body → `content/legal/privacy.md`
- [ ] Extract `app/(chromed)/terms-and-conditions/page.tsx` body → `content/legal/terms.md`
- [ ] Extract `app/(chromed)/warranty-terms/page.tsx` body → `content/legal/warranty.md`
- [ ] Render the `.md` via `react-markdown` (already installed) + `remark-gfm` (confirm installed)
- [ ] Wire any brand tokens left in the page shells (titles, contact lines) to `siteConfig`
- [ ] **Remove the `httpbin.org` debug fetches** — `privacy/page.tsx:12` and
      `warranty-terms/page.tsx:8` call `fetch("https://httpbin.org/delay/3")`; result is
      unused, adds 3s latency, breaks offline/CI (plan §6 edge case #1)
- [ ] **Delete the orphan scaffold** in `terms-and-conditions/` — `SectionFounder.tsx`,
      `SectionHero.tsx`, `SectionStatistic.tsx` (verify no imports first; plan §6 edge case #6)
- [ ] Verify: `/privacy`, `/terms-and-conditions`, `/warranty-terms` render correctly after migration
- [ ] Re-run the Phase 1 DoD grep — legal pages should no longer be an exception

> Until this is done, treat `/privacy`, `/terms-and-conditions`, `/warranty-terms` as
> tenant content a fork must rewrite by hand.

---

## Phase 2 — lib lifts + currency formatting

- [ ] `lib/formatPrice.ts`, `lib/checkoutMath.ts`, `lib/api.ts` created and wired
- [ ] All `api.gqmobiles.lk` REST URLs routed through `apiUrl()`
- [ ] `productSchema` JSON-LD reads from `siteConfig`
- [ ] Verify: prices format correctly (PDP, cart, checkout, filters); bank-receipt upload,
      contact form, payment callbacks still hit the right endpoints

## Phase 3 — extract data hooks

- [ ] 18 hooks created under `hooks/`; no `useQuery`/`useMutation` left in presentation components
- [ ] Gateway if/else in `checkout/page.tsx` left intact
- [ ] Verify: free-gift/quick-view/tech-spec on PDP; coupon/shipping/**checkout** (sandbox order);
      my-orders, order-by-id, reset/forgot password; nav brands + hero slides

## Phase 4 — component reorganization

- [ ] Files moved into `components/{layout,primitives,ui}/`; imports updated
- [ ] Dead/debug artifacts removed (test page, page2, httpbin fetches, dead imports, bare-IP route)
- [ ] Verify: **every route** in the per-route smoke test above (import churn = highest risk)

## Phase 5 — theme tokens end-to-end

- [ ] Full CSS var scale in `globals.css`; `primaryColor` removed from `tailwind.config`
- [ ] `bg-[#…]` hex escapes swapped to tokens; scrollbar leftover fixed
- [ ] Verify: primary/secondary/danger/success colors render correctly on cards, sale badges,
      hero, checkout; dark mode; no stray hardcoded colors

## Phase 6 — backend Docker base (separate repo `gq-backend-plugins`)

- [ ] `mu-plugins/core` vs `mu-plugins/gq` split; base + tenant Dockerfiles build
- [ ] `tripwire.php` allowlist updated (else error_log spam)
- [ ] Verify in staging: GQ runs against the tenant image with no functional regression

---

## Fork checklist (post-cleanup, for a new tenant)

1. [ ] Clone repo → new tenant repo
2. [ ] Edit `site.config.ts` (brand, urls, locale, contact, gateways, GA id)
3. [ ] Replace `content/*.json` (+ legal copy)
4. [ ] Swap CSS variable values in `app/globals.css`
5. [ ] Replace `components/ui/*` per the new design
6. [ ] Run `npm run codegen` against the tenant's WC backend
7. [ ] Adjust route dirs + `revalidatePath` calls; delete unused gateway API routes
8. [ ] New Typesense collection; new Vercel project; tenant Docker image `FROM wp-storefront-base`
9. [ ] Run this checklist end-to-end before launch
