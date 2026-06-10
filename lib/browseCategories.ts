import { siteConfig } from "@/site.config";

import { buildCategoryScopeIds, type CategoryTreeNode } from "@/lib/categoryScope";

/** Homepage browse grid — first batch fetched per category tab on SSR. */
export const BROWSE_CATEGORY_TAB_SSR_FIRST = 24;

/** Client pagination batch after the SSR seed (larger cursor fetches). */
export const BROWSE_CATEGORY_TAB_FETCH_BATCH = 100;

/** Homepage browse tabs — same slugs/order as main nav pet categories. */
export const BROWSE_TAB_SLUGS = siteConfig.navigation.main.map((item) =>
  item.href.replace(/^\//, ""),
);

/** WP slug aliases when the store slug differs from nav href. */
const BROWSE_TAB_SLUG_ALIASES: Record<string, string[]> = {
  "rabbit-hamsters": ["rabbit-hamsters", "rabbit-hamster"],
};

/**
 * Explicit category scopes when WP has duplicate roots or nested `children`
 * are missing from the browse tabs query. Keys are canonical nav slugs.
 */
export const BROWSE_CATEGORY_SCOPE_OVERRIDES: Record<string, number[]> = {
  "rabbit-hamsters": [68, 69, 81],
};

/** Static browse banners under `public/homepage/categories/`. */
export const BROWSE_CATEGORY_FEATURE_IMAGES: Record<string, string> = {
  "rabbit-hamsters": "/homepage/categories/rabbit.webp",
  cat: "/homepage/categories/Cat.webp",
  dog: "/homepage/categories/Dog.webp",
  "cat-dog": "/homepage/categories/cat-dog.webp",
  bird: "/homepage/categories/bird.webp",
  aquarium: "/homepage/categories/fish.webp",
};

/** "All" tab banner — same artwork as the Dog category. */
export const BROWSE_ALL_TAB_FEATURE_IMAGE =
  BROWSE_CATEGORY_FEATURE_IMAGES.dog;

/** Feature banner for a nav tab slug (`cat`, `dog`, …). */
export const getBrowseFeatureImageForNavSlug = (
  navSlug: string,
): string | undefined => BROWSE_CATEGORY_FEATURE_IMAGES[navSlug];

const slugMatchesBrowseTab = (categorySlug: string, tabSlug: string) => {
  const aliases = BROWSE_TAB_SLUG_ALIASES[tabSlug] ?? [tabSlug];
  return aliases.includes(categorySlug);
};

/** Prefer the canonical nav slug; fall back to aliases (e.g. rabbit-hamster). */
const findBrowseTabCategory = <T extends BrowseCategoryLike>(
  eligible: T[],
  tabSlug: string,
): T | undefined =>
  eligible.find((item) => item.slug === tabSlug) ??
  eligible.find(
    (item) => item.slug && slugMatchesBrowseTab(item.slug, tabSlug),
  );

/** Canonical nav slug for a WooCommerce category slug. */
export const getBrowseNavSlugForCategory = (
  categorySlug: string,
): string | undefined => {
  for (const tabSlug of BROWSE_TAB_SLUGS) {
    if (slugMatchesBrowseTab(categorySlug, tabSlug)) return tabSlug;
  }
  return undefined;
};

/** Resolve the homepage browse banner for a category slug. */
export const getBrowseCategoryFeatureImage = (
  slug: string,
): string | undefined => {
  const navSlug = getBrowseNavSlugForCategory(slug);
  return navSlug ? BROWSE_CATEGORY_FEATURE_IMAGES[navSlug] : undefined;
};

/** Nav-order feature banner for a filtered browse tab (index matches `BROWSE_TAB_SLUGS`). */
export const getBrowseFeatureImageForTabIndex = (
  tabIndex: number,
): string | undefined => {
  const navSlug = BROWSE_TAB_SLUGS[tabIndex];
  return navSlug ? BROWSE_CATEGORY_FEATURE_IMAGES[navSlug] : undefined;
};

export type BrowseCategoryLike = {
  slug?: string | null;
  databaseId?: number | null;
  parentDatabaseId?: number | null;
  name?: string | null;
  children?: CategoryTreeNode["children"];
};

/** Product query scope: parent + subcategories (override or nested tree). */
export const resolveBrowseCategoryScopeIds = (
  category: BrowseCategoryLike,
): number[] => {
  if (category.slug && BROWSE_CATEGORY_SCOPE_OVERRIDES[category.slug]) {
    return BROWSE_CATEGORY_SCOPE_OVERRIDES[category.slug];
  }

  if (typeof category.databaseId !== "number") return [];

  return buildCategoryScopeIds(
    category.databaseId,
    category.children?.nodes,
  );
};

export const buildBrowseCategoryScopeMap = (
  categories: BrowseCategoryLike[],
): Record<number, number[]> =>
  Object.fromEntries(
    categories
      .filter(
        (category): category is BrowseCategoryLike & { databaseId: number } =>
          typeof category.databaseId === "number",
      )
      .map((category) => [
        category.databaseId,
        resolveBrowseCategoryScopeIds(category),
      ]),
  );

/** Keep only configured browse tabs, in nav order. */
export const filterBrowseCategoryTabs = <T extends BrowseCategoryLike>(
  categories: T[],
): T[] => {
  const hasCanonicalRabbit = categories.some(
    (category) =>
      category?.slug === "rabbit-hamsters" &&
      (category.parentDatabaseId == null || category.parentDatabaseId === 0),
  );

  const eligible = categories.filter(
    (category) =>
      typeof category.databaseId === "number" &&
      !!category.slug &&
      (category.parentDatabaseId == null || category.parentDatabaseId === 0) &&
      !(category.slug === "rabbit-hamster" && hasCanonicalRabbit) &&
      BROWSE_TAB_SLUGS.some((tabSlug) =>
        slugMatchesBrowseTab(category.slug!, tabSlug),
      ),
  );

  return BROWSE_TAB_SLUGS.flatMap((tabSlug) => {
    const category = findBrowseTabCategory(eligible, tabSlug);
    return category ? [category] : [];
  });
};

/** Sort category nodes to match main nav order (unlisted slugs trail). */
export const sortByMainNavCategoryOrder = <T extends BrowseCategoryLike>(
  categories: T[],
): T[] =>
  [...categories].sort((a, b) => {
    const indexFor = (slug: string | null | undefined) => {
      if (!slug) return Number.MAX_SAFE_INTEGER;
      const index = BROWSE_TAB_SLUGS.findIndex((tabSlug) =>
        slugMatchesBrowseTab(slug, tabSlug),
      );
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };
    return indexFor(a.slug) - indexFor(b.slug);
  });
