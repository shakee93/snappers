import ProductCard from "@/components/global/ui/ProductCard3";
import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_CATEGORY_ARCHIVE_IN_STOCK,
  GET_PRODUCTS_NODES,
} from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

export interface ProductGridGraphQLProps {
  categoryId?: number;
  first?: number;
}

const ProductGridGraphQL = async ({
  categoryId,
  first = 45,
}: ProductGridGraphQLProps) => {
  const { data } = await getClient().query({
    query: categoryId ? GET_CATEGORY_ARCHIVE_IN_STOCK : GET_PRODUCTS_NODES,
    variables: categoryId
      ? { categoryIdIn: [categoryId], first }
      : { first },
  });

  type ArchiveProduct = SimpleProduct & VariableProduct;

  const products: ArchiveProduct[] = categoryId
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} data={product} />
      ))}
    </div>
  );
};

export default ProductGridGraphQL;
