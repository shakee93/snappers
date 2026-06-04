import { getClient } from "@/graphql/apollo-ssr";
import { GET_CATEGORY_ARCHIVE_IN_STOCK } from "@/graphql/defs/products";
import type { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { isProductInStock } from "@/lib/isProductInStock";

type ProductNode = SimpleProduct | VariableProduct;

type ProductWithRelations = ProductNode & {
  databaseId: number;
  slug?: string | null;
  upsell?: { nodes?: ProductNode[] | null } | null;
  related?: { nodes?: ProductNode[] | null } | null;
  productCategories?: {
    edges?: Array<{ node?: { databaseId?: number } | null } | null> | null;
  } | null;
};

/** Products for the PDP slider: Woo upsells, then WC related, then same-category fallback. */
export async function getPdpRelatedProducts(
  product: ProductWithRelations,
  cacheTag: string
): Promise<ProductNode[]> {
  const excludeId = product.databaseId;

  const isEligible = (p: ProductNode) =>
    p.databaseId !== excludeId && isProductInStock(p);

  const upsellNodes = (product.upsell?.nodes ?? []) as ProductNode[];
  const fromUpsell = upsellNodes.filter(isEligible);
  if (fromUpsell.length > 0) {
    return fromUpsell;
  }

  const relatedNodes = (product.related?.nodes ?? []) as ProductNode[];
  const fromRelated = relatedNodes.filter(isEligible);
  if (fromRelated.length > 0) {
    return fromRelated;
  }

  const categoryIds =
    product.productCategories?.edges
      ?.map((edge) => {
        const node = edge?.node as { databaseId?: number } | null | undefined;
        return node?.databaseId;
      })
      .filter((id): id is number => typeof id === "number") ?? [];

  if (categoryIds.length === 0) {
    return [];
  }

  // Exclude the current product server-side and over-fetch a buffer so the
  // client-side stock refinement below can't shrink the slider under 12.
  const { data } = await getClient().query({
    query: GET_CATEGORY_ARCHIVE_IN_STOCK,
    variables: { categoryIdIn: categoryIds, first: 18, exclude: [excludeId] },
    context: {
      fetchOptions: {
        cache: "force-cache",
        next: { tags: [cacheTag] },
      },
    },
  });

  type CategoryEdge = { node?: ProductNode | null };
  const edges = (data?.products?.edges ?? []) as CategoryEdge[];
  return edges
    .map((edge) => edge?.node)
    .filter(
      (p): p is ProductNode =>
        p != null && typeof p.databaseId === "number" && isProductInStock(p)
    )
    .slice(0, 12);
}
