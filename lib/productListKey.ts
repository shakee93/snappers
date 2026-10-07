export type ProductListKeySource = {
  id?: string | null;
  databaseId?: number | null;
  slug?: string | null;
};

/** Stable React list key for product cards (prefers WooCommerce `databaseId`). */
export function getProductListKey(
  product: ProductListKeySource,
  index: number,
): string {
  if (typeof product.databaseId === "number") {
    return `product-${product.databaseId}`;
  }
  const id = product.id?.trim();
  if (id) return id;
  const slug = product.slug?.trim();
  if (slug) return `slug-${slug}`;
  return `product-list-${index}`;
}
