import {
  findTierForGateway,
  getProductPriceTiers,
  resolveTierUnitPrice,
  type ProductWithPriceTiers,
} from "@/lib/priceTiers";
import { parseWooMoneyAmount } from "@/lib/cartLinePricing";

export type CheckoutCartLine = {
  quantity?: number | null;
  subtotal?: string | null;
  product?: {
    node?:
      | (ProductWithPriceTiers & {
          type?: string | null;
          price?: string | number | null;
        })
      | null;
  } | null;
  variation?: { node?: { price?: string | number | null } | null } | null;
};

/** Catalog unit price for a cart line, falling back to the line subtotal / qty. */
export function getLineUnitPrice(item: CheckoutCartLine): number {
  const node = item.product?.node;
  const priceStr = node?.type === "VARIABLE" ? item.variation?.node?.price : node?.price;
  const parsed = parseWooMoneyAmount(priceStr);
  if (parsed > 0) return parsed;

  const lineSubtotal = parseWooMoneyAmount(item.subtotal);
  const qty = item.quantity || 0;
  return lineSubtotal > 0 && qty > 0 ? lineSubtotal / qty : 0;
}

export type CartLineTierPrice = {
  /** Unit price the selected gateway is quoted at. */
  unitPrice: number;
  /** Catalog unit price the tier replaces — rendered struck through. */
  catalogUnitPrice: number;
  /** Tier name as configured in woo-price-tiers, e.g. "Visa / Master Card". */
  tierName: string;
};

/**
 * Unit price a cart line carries under the selected payment gateway.
 * Null when the product has no tier for that gateway, or the tier quotes the
 * catalog price anyway — nothing to surface in that case.
 */
export function resolveCartLineTierPrice(
  item: CheckoutCartLine,
  gatewayId: string,
): CartLineTierPrice | null {
  if (!gatewayId) return null;

  const tier = findTierForGateway(
    getProductPriceTiers(item.product?.node),
    gatewayId,
  );
  if (!tier) return null;

  const catalogUnitPrice = getLineUnitPrice(item);
  const unitPrice = resolveTierUnitPrice(tier, catalogUnitPrice);
  if (unitPrice <= 0 || unitPrice === catalogUnitPrice) return null;

  return { unitPrice, catalogUnitPrice, tierName: tier.name.trim() };
}
