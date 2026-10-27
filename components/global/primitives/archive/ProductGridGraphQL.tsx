import { ARCHIVE_PRODUCT_GRID_CLASS_NAME } from "@/components/global/primitives/Loading/ProductCardLoading";
import ProductCard from "@/components/home/ProductCard";
import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_CATEGORY_ARCHIVE_IN_STOCK,
  GET_PRODUCTS_NODES,
} from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

export interface ProductGridGraphQLProps {
  categoryIds?: number[];
  first?: number;
}

const ProductGridGraphQL = async ({
  categoryIds,
  first = 48,
}: ProductGridGraphQLProps) => {
  const hasCategoryFilter = categoryIds && categoryIds.length > 0;

  const { data } = await getClient().query({
    query: hasCategoryFilter ? GET_CATEGORY_ARCHIVE_IN_STOCK : GET_PRODUCTS_NODES,
    variables: hasCategoryFilter
      ? { categoryIdIn: categoryIds, first }
      : { first },
  });

  type ArchiveProduct = SimpleProduct & VariableProduct;

  const products: ArchiveProduct[] = hasCategoryFilter
    ? (data?.products?.edges ?? []).flatMap(
        (edge: { node?: ArchiveProduct | null }) =>
          edge.node ? [edge.node] : []
      )
    : ((data?.products?.nodes ?? []) as ArchiveProduct[]);

  if (!products?.length) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        No products found in this collection.
      </p>
    );
  }

  return (
    <div className={ARCHIVE_PRODUCT_GRID_CLASS_NAME}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGridGraphQL;
