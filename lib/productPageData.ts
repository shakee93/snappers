import { getClient } from "@/graphql/apollo-ssr";
import { GET_PRODUCT } from "@/graphql/defs/products";
import { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { productTag } from "@/lib/cache-tags";
import { getPdpRelatedProducts } from "@/lib/pdpRelatedProducts";
import {
  FALLBACK_CATEGORY_NAME,
  getPrimaryCategorySlug,
  getProductCategories,
} from "@/lib/productUrl";

export type ProductPageData = {
  product: SimpleProduct & VariableProduct;
  brand: Brand;
  upsellProducts: Awaited<ReturnType<typeof getPdpRelatedProducts>>;
  primaryCategorySlug: string;
  primaryCategoryName: string;
};

/**
 * Resolve a slug as a product. Returns null when it is not one.
 *
 * Pass `withRelated: false` from metadata-only callers (e.g. `generateMetadata`)
 * to skip the related-products fetch, which `<title>`/OG tags never use. The
 * `GET_PRODUCT` query itself is `force-cache`d, so the page-body call that does
 * need related products reuses the same cached response.
 */
export async function getProductPageData(
  slug: string,
  { withRelated = true }: { withRelated?: boolean } = {},
): Promise<ProductPageData | null> {
  try {
    const { data, error } = await getClient().query({
      query: GET_PRODUCT,
      variables: {
        productId: slug,
      },
      context: {
        fetchOptions: {
          cache: "force-cache",
          next: { tags: [productTag(slug)] },
        },
      },
    });

    if (error || !data.product) {
      return null;
    }

    const productBrand = data.product?.brands?.nodes?.[0] || {
      name: "Product",
      slug: "product",
    };

    const upsellProducts = withRelated
      ? await getPdpRelatedProducts(data.product, productTag(slug))
      : [];

    const categories = getProductCategories(data.product);
    const primaryCategorySlug = getPrimaryCategorySlug(data.product);
    const primaryCategory =
      categories.find((category) => category.slug === primaryCategorySlug) ??
      categories[0];

    return {
      product: data.product as SimpleProduct & VariableProduct,
      brand: productBrand as Brand,
      upsellProducts,
      primaryCategorySlug,
      // No real category → the breadcrumb falls back to the shop archive, so
      // label it accordingly instead of echoing the synthetic "shop" slug.
      primaryCategoryName:
        primaryCategory?.name ??
        (categories.length === 0 ? FALLBACK_CATEGORY_NAME : primaryCategorySlug),
    };
  } catch (e) {
    console.error("Error fetching product data:", e);
    return null;
  }
}
