import { getClient } from "@/graphql/apollo-ssr";
import { GET_PRODUCT } from "@/graphql/defs/products";
import { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { productTag } from "@/lib/cache-tags";
import { getPdpRelatedProducts } from "@/lib/pdpRelatedProducts";
import {
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

/** Resolve a slug as a product. Returns null when it is not one. */
export async function getProductPageData(
  slug: string,
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

    const upsellProducts = await getPdpRelatedProducts(
      data.product,
      productTag(slug),
    );

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
      primaryCategoryName: primaryCategory?.name ?? primaryCategorySlug,
    };
  } catch (e) {
    console.error("Error fetching product data:", e);
    return null;
  }
}
