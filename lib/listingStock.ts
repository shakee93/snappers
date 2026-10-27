type VariationStockLike = {
  stockStatus?: string | null;
} | null;

type ListingStockProduct = {
  type?: string | null;
  stockStatus?: string | null;
  purchasable?: boolean | null;
  variations?: { nodes?: VariationStockLike[] | null } | null;
};

/** Whether a listing card should show as out of stock (Add disabled). */
export function isListingProductOutOfStock(product: ListingStockProduct): boolean {
  if (product.purchasable === false) return true;

  if (product.type === "VARIABLE") {
    const variations = product.variations?.nodes ?? [];
    if (variations.some((v) => v?.stockStatus === "IN_STOCK")) return false;
  }

  if (product.stockStatus == null) return false;
  return product.stockStatus !== "IN_STOCK";
}
