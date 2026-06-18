import { getClient } from "@/graphql/apollo-ssr";
import { GET_CATEGORY_ARCHIVE_RELATED } from "@/graphql/defs/products";
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

const MAX_RELATED = 12;

const dedupeProducts = (
  products: ProductNode[],
  excludeId: number,
  seen: Set<number>,
): ProductNode[] => {
  const result: ProductNode[] = [];

  for (const product of products) {
    if (product.databaseId === excludeId || seen.has(product.databaseId)) {
      continue;
    }

    seen.add(product.databaseId);
    result.push(product);
  }

  return result;
};

const preferInStock = (products: ProductNode[]): ProductNode[] =>
  [...products].sort((a, b) => {
    const aRank = isProductInStock(a) ? 0 : 1;
    const bRank = isProductInStock(b) ? 0 : 1;
    return aRank - bRank;
  });

const getCategoryDatabaseIds = (product: ProductWithRelations): number[] => {
  const edges = product.productCategories?.edges ?? [];
  return edges
    .map((edge) => {
      const node = edge?.node as { databaseId?: number } | null | undefined;
      return node?.databaseId;
    })
    .filter((id): id is number => typeof id === "number");
};

/** PDP related row: upsells + WC related, then same-category fallback to fill the grid. */
export async function getPdpRelatedProducts(
  product: ProductWithRelations,
  cacheTag: string,
): Promise<ProductNode[]> {
  const excludeId = product.databaseId;
  const seen = new Set<number>();
  const upsellNodes = (product.upsell?.nodes ?? []) as ProductNode[];
  const relatedNodes = (product.related?.nodes ?? []) as ProductNode[];

  let combined = dedupeProducts(
    [...upsellNodes, ...relatedNodes],
    excludeId,
    seen,
  );

  if (combined.length < MAX_RELATED) {
    const categoryIds = getCategoryDatabaseIds(product);

    if (categoryIds.length > 0) {
      const isDev = process.env.NODE_ENV === "development";
      const { data } = await getClient().query({
        query: GET_CATEGORY_ARCHIVE_RELATED,
        variables: {
          categoryIdIn: categoryIds,
          first: 18,
          exclude: [excludeId],
        },
        context: {
          fetchOptions: isDev
            ? { cache: "no-store" }
            : {
                cache: "force-cache",
                next: { tags: [cacheTag] },
              },
        },
      });

      type CategoryEdge = { node?: ProductNode | null };
      const edges = (data?.products?.edges ?? []) as CategoryEdge[];
      const fromCategory = edges
        .map((edge) => edge?.node)
        .filter(
          (node): node is ProductNode =>
            node != null && typeof node.databaseId === "number",
        );

      combined = [
        ...combined,
        ...dedupeProducts(fromCategory, excludeId, seen),
      ];
    }
  }

  return preferInStock(combined).slice(0, MAX_RELATED);
}
