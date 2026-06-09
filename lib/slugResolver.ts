import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRAND, GET_CATEGORY } from "@/graphql/defs/products";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { getProductPageData, ProductPageData } from "@/lib/productPageData";

export type SlugResolution =
  | { type: "product"; data: ProductPageData }
  | { type: "category"; data: { productCategory: ProductCategory } }
  | { type: "brand"; data: { brand: Brand } };

async function getCategoryBySlug(slug: string) {
  const { data } = await getClient().query({
    query: GET_CATEGORY,
    variables: {
      categoryId: slug,
    },
  });

  if (!data.productCategory) {
    return null;
  }

  return { productCategory: data.productCategory as ProductCategory };
}

async function getBrandBySlug(slug: string) {
  const { data } = await getClient().query({
    query: GET_BRAND,
    variables: {
      brandId: slug,
    },
  });

  if (!data.brand) {
    return null;
  }

  return { brand: data.brand as Brand };
}

/**
 * Resolve a single URL segment as product, category, or brand.
 * Priority: product → category → brand (first match wins).
 */
export async function resolveSlug(slug: string): Promise<SlugResolution | null> {
  const productData = await getProductPageData(slug);
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
