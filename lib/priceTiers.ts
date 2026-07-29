import { siteConfig } from "@/site.config";

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

export function isBankTransferTier(name: string | null | undefined): boolean {
  return /bank\s*transfer/i.test(name ?? "");
}

export function isCardTier(name: string | null | undefined): boolean {
  return /visa|mastercard|card/i.test(name ?? "");
}

/** Backend KOKO tier price is the final payable total — split into 3 installments. */
export function kokoInstallmentAmount(totalPrice: number): number {
  return totalPrice > 0 ? totalPrice / 3 : 0;
}

/** Card gateways all quote the single Visa/Mastercard tier on the backend. */
export function isCardPaymentGateway(gatewayId: string): boolean {
  return (siteConfig.payment.cardGatewayIds as readonly string[]).includes(
    gatewayId,
  );
}

/** Map a WooCommerce gateway id onto the tier the plugin names it after. */
export function tierMatchesGateway(
  tierName: string,
  gatewayId: string,
): boolean {
  if (!gatewayId) return false;
  if (gatewayId === "darazbnpl") return isKokoTier(tierName);
  if (gatewayId === "cod") return isCodTier(tierName);
  if (gatewayId === "bacs") return isBankTransferTier(tierName);
  if (isCardPaymentGateway(gatewayId)) return isCardTier(tierName);
  return false;
}

export function findTierForGateway(
  tiers: readonly ResolvedPriceTier[],
  gatewayId: string,
): ResolvedPriceTier | null {
  return tiers.find((tier) => tierMatchesGateway(tier.name, gatewayId)) ?? null;
}

/**
 * Treat price <= 0 as missing — variable parents return null tier prices, so
 * the caller's own price stands in.
 */
export function resolveTierUnitPrice(
  tier: ResolvedPriceTier,
  fallbackPrice: number,
): number {
  if (
    typeof tier.price === "number" &&
    Number.isFinite(tier.price) &&
    tier.price > 0
  ) {
    return tier.price;
  }
  return fallbackPrice;
}
