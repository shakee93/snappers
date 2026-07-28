/**
 * Shape returned by the woo-price-tiers WPGraphQL field on Product.
 * Not yet in generated types (API introspection is often disabled).
 */
export type ProductPriceTier = {
  name?: string | null;
  price?: number | null;
  imageUrl?: string | null;
};

export type ProductWithPriceTiers = {
  priceTiers?: ProductPriceTier[] | null;
};

export function getProductPriceTiers(
  product: ProductWithPriceTiers | null | undefined,
): ProductPriceTier[] {
  return product?.priceTiers?.filter((tier) => !!tier?.name) ?? [];
}

export function isKokoTier(name: string | null | undefined): boolean {
  return (name ?? "").trim().toLowerCase() === "koko";
}
