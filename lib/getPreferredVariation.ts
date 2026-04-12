/**
 * Returns the lowest-price in-stock variation, or falls back to the first variation
 * if none are in stock (or if the list is empty/undefined).
 */
export function getPreferredVariation(
  variations: any[] | undefined | null
): any | undefined {
  if (!variations || variations.length === 0) return undefined;

  const inStockVariation = variations
    .filter((v: any) => v.stockStatus === "IN_STOCK")
    .reduce((lowest: any, v: any) => {
      const currentPrice = parseFloat(v?.rawPrice || "0");
      const lowestPrice = parseFloat(lowest?.rawPrice || "Infinity");
      return currentPrice < lowestPrice ? v : lowest;
    }, undefined);

  return inStockVariation || variations[0];
}
