type VariationWithPrice = {
  rawPrice?: string | null;
  salePrice?: string | null;
  price?: string | null;
  stockStatus?: string | null;
};

export function getVariationNumericPrice(
  variation: VariationWithPrice | null | undefined,
): number {
  const raw =
    variation?.rawPrice ?? variation?.salePrice ?? variation?.price ?? "0";
  return parseFloat(String(raw).replace(/[^\d.]/g, "")) || 0;
}

export function getLowestPriceVariation<T extends VariationWithPrice>(
  variations: T[] | undefined | null,
): T | undefined {
  if (!variations?.length) return undefined;

  return variations.reduce((lowest, variation) =>
    getVariationNumericPrice(variation) < getVariationNumericPrice(lowest)
      ? variation
      : lowest,
  );
}

/**
 * Returns the lowest-price in-stock variation, or the lowest-price variation
 * overall when none are in stock.
 */
export function getPreferredVariation<T extends VariationWithPrice>(
  variations: T[] | undefined | null,
): T | undefined {
  if (!variations?.length) return undefined;

  const inStockVariations = variations.filter(
    (variation) => variation.stockStatus === "IN_STOCK",
  );

  if (inStockVariations.length > 0) {
    return getLowestPriceVariation(inStockVariations);
  }

  return getLowestPriceVariation(variations);
}
