/**
 * Shape returned by the woo-price-tiers WPGraphQL field on Product.
 * Not yet in generated types (API introspection is often disabled).
 */
export type ProductPriceTier = {
  name?: string | null;
  price?: number | null;
  imageUrl?: string | null;
};

export type ResolvedPriceTier = ProductPriceTier & { name: string };

export type ProductWithPriceTiers = {
  priceTiers?: ProductPriceTier[] | null;
};

export function getProductPriceTiers(
  product: ProductWithPriceTiers | null | undefined,
): ResolvedPriceTier[] {
  return (product?.priceTiers ?? []).filter(
    (tier): tier is ResolvedPriceTier => !!tier?.name,
  );
}

export function isKokoTier(name: string | null | undefined): boolean {
  return /koko/i.test(name ?? "");
}

export function isCodTier(name: string | null | undefined): boolean {
  return /cash\s*on\s*delivery|^cod$/i.test(name ?? "");
}

/** Backend KOKO tier price is the final payable total — split into 3 installments. */
export function kokoInstallmentAmount(totalPrice: number): number {
  return totalPrice > 0 ? totalPrice / 3 : 0;
}
