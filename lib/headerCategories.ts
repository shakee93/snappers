import type { ProductCategory } from "@/graphql/types/graphql";

const DEALS_SLUG = "deals";
const GROCERIES_SLUG = "groceries";
const BAKERY_SLUG = "bakery";
const HOUSEHOLD_SLUG = "household";

/** Root categories pinned immediately after Deals, in order. */
const HEADER_BAR_PINNED_AFTER_DEALS = [GROCERIES_SLUG] as const;

const HIDDEN_CATEGORY_SLUGS = new Set([
  "uncategorized",
  "gift-vouchers",
  "ramzan-package",
]);

function isRootCategory(category: ProductCategory): boolean {
  const parent = category.parentDatabaseId;
  return parent == null || parent === 0;
}

function compareCategoryName(a: ProductCategory, b: ProductCategory): number {
  return (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  });
}

/** Header bar: Deals first, pinned roots, then remaining A→Z (excludes hidden slugs). */
export function getHeaderBarCategories(
  navCategories: ProductCategory[],
  limit = 12,
): ProductCategory[] {
  const roots = navCategories.filter(
    (category): category is ProductCategory =>
      !!category?.slug &&
      isRootCategory(category) &&
      !HIDDEN_CATEGORY_SLUGS.has(category.slug),
  );

  const pinnedSlugs = new Set<string>([
    DEALS_SLUG,
    ...HEADER_BAR_PINNED_AFTER_DEALS,
    HOUSEHOLD_SLUG,
  ]);

  const deals = roots.find((category) => category.slug === DEALS_SLUG);
  const pinnedAfterDeals = HEADER_BAR_PINNED_AFTER_DEALS.map((slug) =>
    roots.find((category) => category.slug === slug),
  ).filter((category): category is ProductCategory => !!category);

  const household = roots.find((category) => category.slug === HOUSEHOLD_SLUG);

  const rest = roots
    .filter((category) => category.slug && !pinnedSlugs.has(category.slug))
    .sort(compareCategoryName);

  const orderedRest: ProductCategory[] = [];
  for (const category of rest) {
    orderedRest.push(category);
    if (category.slug === BAKERY_SLUG && household) {
      orderedRest.push(household);
    }
  }

  const ordered = [
    ...(deals ? [deals] : []),
    ...pinnedAfterDeals,
    ...orderedRest,
  ];

  return ordered.slice(0, limit);
}

export function getCategoryArchiveHref(slug: string): string {
  return `/${slug}`;
}

/** Local nav icons (already brand-colored); overrides WooCommerce category images. */
export const HEADER_CATEGORY_ICON_OVERRIDES: Record<string, string> = {
  bakery: "/global/categories/bakery.png",
  beverages: "/global/categories/beverages.png",
  chilled: "/global/categories/chilled.png",
  deals: "/global/categories/deals.png",
  fresh: "/global/categories/fresh.png",
  frozen: "/global/categories/frozen.png",
  groceries: "/global/categories/groceries.png",
  household: "/global/categories/household.png",
};

export function getHeaderCategoryIconSrc(
  category: ProductCategory,
): string | undefined {
  const slug = category.slug;
  if (!slug) return category.image?.sourceUrl ?? undefined;
  return HEADER_CATEGORY_ICON_OVERRIDES[slug] ?? category.image?.sourceUrl ?? undefined;
}
