import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRAND, GET_CATEGORY } from "@/graphql/defs/products";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { isRegisteredArchiveSlug } from "@/lib/archiveSlugRegistry";
import { getProductPageData, ProductPageData } from "@/lib/productPageData";

export type SlugResolution =
  | { type: "product"; data: ProductPageData }
  | { type: "category"; data: { productCategory: ProductCategory } }
  | { type: "brand"; data: { brand: Brand } };

// Each lookup degrades to null on failure (mirroring getProductPageData) so a
// transient GraphQL error on one entity type doesn't 500 the request before the
// next type is tried - e.g. a flaky category lookup must not blow up a valid
// brand page.
async function getCategoryBySlug(slug: string) {
  try {
    const { data, error } = await getClient().query({
      query: GET_CATEGORY,
      variables: {
        categoryId: slug,
      },
    });

    if (error || !data.productCategory) {
      return null;
    }

    return { productCategory: data.productCategory as ProductCategory };
  } catch (e) {
    console.error("Error resolving category slug:", e);
    return null;
  }
}

async function getBrandBySlug(slug: string) {
  try {
    const { data, error } = await getClient().query({
      query: GET_BRAND,
      variables: {
        brandId: slug,
      },
    });

    if (error || !data.brand) {
      return null;
    }

    return { brand: data.brand as Brand };
  } catch (e) {
    console.error("Error resolving brand slug:", e);
    return null;
  }
}

/**
 * Resolve a single URL segment as product, category, or brand.
 * Priority: product → category → brand (first match wins).
 *
 * ASSUMPTION: slugs are globally unique across products, categories, and brands.
 * WooCommerce does not enforce this, so if two entity types share a slug the
 * lower-priority one is shadowed (its URL renders the higher-priority entity).
 * The sitemaps still emit every entity's URL, so a collision would surface as a
 * sitemap URL rendering the wrong page. Keep slugs distinct across the three
 * namespaces; if collisions become possible, add a build/sitemap-time guard.
 *
 * `withRelated` is forwarded to the product resolver - pass `false` from
 * metadata-only callers to skip the unused related-products fetch.
 */
export async function resolveSlug(
  slug: string,
  opts?: { withRelated?: boolean },
): Promise<SlugResolution | null> {
  // Main nav / seeded archive slugs (e.g. groceries) are categories - skip
  // GetProduct so WPGraphQL does not error on idType SLUG misses.
  if (isRegisteredArchiveSlug(slug)) {
    const categoryData = await getCategoryBySlug(slug);
    if (categoryData) {
      return { type: "category", data: categoryData };
    }

    const brandData = await getBrandBySlug(slug);
    if (brandData) {
      return { type: "brand", data: brandData };
    }
  }

  const productData = await getProductPageData(slug, opts);
  if (productData) {
    return { type: "product", data: productData };
  }

  const categoryData = await getCategoryBySlug(slug);
  if (categoryData) {
    return { type: "category", data: categoryData };
  }

  const brandData = await getBrandBySlug(slug);
  if (brandData) {
    return { type: "brand", data: brandData };
  }

  return null;
}
