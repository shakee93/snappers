type CategoryLike = {
  slug?: string | null;
  name?: string | null;
  parentDatabaseId?: number | null;
};

type ProductLike = {
  slug?: string | null;
  productCategories?: {
    nodes?: Array<CategoryLike | null> | null;
    edges?: Array<{ node?: CategoryLike | null } | null> | null;
  } | null;
};

// Breadcrumb fallback for products with no real WooCommerce category. Uses the
// shop archive slug rather than a synthetic "product" slug, which would resolve
// to a 404 through `resolveSlug`. `FALLBACK_CATEGORY_NAME` is its label.
const FALLBACK_CATEGORY_SLUG = "shop";
export const FALLBACK_CATEGORY_NAME = "Shop";

/** Product listing archive — all products with filters. */
export const SHOP_PATH = "/shop";

/** Category index — browse all categories. */
export const CATEGORIES_ARCHIVE_PATH = "/categories";

/** Brand index — browse all brands. */
export const BRANDS_ARCHIVE_PATH = "/brands";

export function getProductCategories(product: ProductLike): CategoryLike[] {
  const fromNodes = product.productCategories?.nodes ?? [];
  const fromEdges =
    product.productCategories?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is CategoryLike => !!node?.slug) ?? [];

  const categories = [...fromNodes, ...fromEdges].filter(
    (category): category is CategoryLike => !!category?.slug,
  );

  const seen = new Set<string>();
  return categories.filter((category) => {
    const slug = category.slug!;
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

/** Prefer the most specific (child) WooCommerce category for breadcrumbs. */
export function getPrimaryCategorySlug(product: ProductLike): string {
  const categories = getProductCategories(product);
  if (categories.length === 0) {
    return FALLBACK_CATEGORY_SLUG;
  }

  const childCategories = categories.filter(
    (category) => (category.parentDatabaseId ?? 0) > 0,
  );
  if (childCategories.length > 0) {
    return childCategories[0].slug!;
  }

  return categories[0].slug!;
}

/** Canonical PDP path — flat at /{slug}. Product slugs are globally unique. */
export function getProductPath(product: ProductLike): string {
  const slug = product.slug;
  if (!slug) {
    return "/";
  }

  return `/${slug}`;
}

/** Canonical category listing path — flat at /{slug}. */
export function getCategoryPath(slug: string): string {
  return `/${slug}`;
}

/** Canonical brand archive path — flat at /{slug}. */
export function getBrandPath(slug: string): string {
  return `/${slug}`;
}
