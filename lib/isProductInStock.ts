type StockProduct = {
  type?: string | null;
  stockStatus?: string | null;
};

/**
 * True when the product card will render as available (not "Sold Out").
 *
 * WooCommerce keeps the parent `stockStatus` as the aggregate for variable
 * products (IN_STOCK when any variation is purchasable, OUTOFSTOCK when none
 * are), and ProductCard3 draws the "Sold Out" badge off this same parent
 * field. The server-side category query (GET_CATEGORY_ARCHIVE_IN_STOCK) also
 * filters on the parent `stockStatus`. Matching the parent field here keeps
 * the slider filter, the card badge, and the server query in agreement.
 */
export function isProductInStock(product: StockProduct): boolean {
  return product.stockStatus === "IN_STOCK";
}
