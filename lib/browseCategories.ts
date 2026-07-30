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
 * Shared WP roots whose products should also appear under these nav tabs.
 * Keeps "Cat & Dog" items visible under Cat and Dog instead of a separate tab.
 */
export const NAV_SHARED_CATEGORY_SLUGS: Record<string, readonly string[]> = {
  cat: ["cat-dog"],
  dog: ["cat-dog"],
};

/**
 * Extra category databaseIds merged into a nav tab's product scope.
 * Fallback when the shared root isn't available in the current category list.
 *
 * IDs: cat-dog (34) + Accessories (41) + its children + Health (49) + Medicine (50).
 */
export const CATEGORY_SCOPE_EXTRA_IDS: Record<string, readonly number[]> = {
  cat: [34, 41, 70, 54, 42, 49, 50],
  dog: [34, 41, 70, 54, 42, 49, 50],
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

/** "All" tab banner — dedicated all-pets artwork. */
export const BROWSE_ALL_TAB_FEATURE_IMAGE = "/homepage/categories/all.webp";

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

const uniqueIds = (ids: number[]): number[] => Array.from(new Set(ids));

/** Extra scope IDs for a nav/category slug (shared cat-dog under cat/dog, etc.). */
export const getCategoryScopeExtraIds = (
  slug: string | null | undefined,
): number[] => {
  if (!slug) return [];
  const navSlug = getBrowseNavSlugForCategory(slug) ?? slug;
  return [...(CATEGORY_SCOPE_EXTRA_IDS[navSlug] ?? [])];
};

/**
 * Merge shared-root trees from `allRoots` into a base scope when the tab
 * declares `NAV_SHARED_CATEGORY_SLUGS` (preferred over hardcoded extras when
 * the full category list is available).
 */
const appendSharedRootScopes = (
  baseIds: number[],
  categorySlug: string | null | undefined,
  allRoots?: BrowseCategoryLike[],
): number[] => {
  if (!categorySlug || !allRoots?.length) {
    return uniqueIds([...baseIds, ...getCategoryScopeExtraIds(categorySlug)]);
  }

  const navSlug = getBrowseNavSlugForCategory(categorySlug) ?? categorySlug;
  const sharedSlugs = NAV_SHARED_CATEGORY_SLUGS[navSlug] ?? [];
  if (sharedSlugs.length === 0) {
    return uniqueIds([...baseIds, ...getCategoryScopeExtraIds(categorySlug)]);
  }

  const sharedIds = sharedSlugs.flatMap((sharedSlug) => {
    const shared = allRoots.find((item) => item.slug === sharedSlug);
    if (typeof shared?.databaseId !== "number") return [];
    return buildCategoryScopeIds(shared.databaseId, shared.children?.nodes);
  });

  if (sharedIds.length === 0) {
    return uniqueIds([...baseIds, ...getCategoryScopeExtraIds(categorySlug)]);
  }

  return uniqueIds([...baseIds, ...sharedIds]);
};

/** Product query scope: parent + subcategories (override or nested tree). */
export const resolveBrowseCategoryScopeIds = (
  category: BrowseCategoryLike,
  allRoots?: BrowseCategoryLike[],
): number[] => {
  let baseIds: number[] = [];

  if (category.slug && BROWSE_CATEGORY_SCOPE_OVERRIDES[category.slug]) {
    baseIds = BROWSE_CATEGORY_SCOPE_OVERRIDES[category.slug];
  } else if (typeof category.databaseId === "number") {
    baseIds = buildCategoryScopeIds(
      category.databaseId,
      category.children?.nodes,
    );
  }

  return appendSharedRootScopes(baseIds, category.slug, allRoots);
};

export const buildBrowseCategoryScopeMap = (
  categories: BrowseCategoryLike[],
  allRoots?: BrowseCategoryLike[],
): Record<number, number[]> =>
  Object.fromEntries(
    categories
      .filter(
        (category): category is BrowseCategoryLike & { databaseId: number } =>
          typeof category.databaseId === "number",
      )
      .map((category) => [
        category.databaseId,
        resolveBrowseCategoryScopeIds(category, allRoots ?? categories),
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
