import { siteConfig } from "@/site.config";
import type { Cart, ShippingRate } from "@/graphql/types/graphql";

/** Methods that represent "customer collects", never a delivery rate. */
const PICKUP_METHOD_IDS = new Set(["pickup_location", "local_pickup"]);

const EXCLUDED_RATE_IDS: ReadonlySet<string> = new Set(
  siteConfig.shipping.excludedRateIds,
);

/** Rates the storefront never offers, however WooCommerce quotes them. */
const isExcludedRate = (rate: ShippingRate): boolean =>
  PICKUP_METHOD_IDS.has(rate.methodId ?? "") || EXCLUDED_RATE_IDS.has(rate.id);

/**
 * How the order is delivered. Not chosen by the customer - it follows from
 * the rates WooCommerce quotes for the address, see resolveDeliveryType.
 */
export type DeliveryType = "courier" | "catlitter_delivery";

/**
 * Rate id of the CatLitter Delivery method. Empty until it is configured in
 * WooCommerce, which keeps every order on the courier rate rather than
 * selecting a rate the store cannot quote.
 */
const CATLITTER_DELIVERY_METHOD_ID: string =
  siteConfig.shipping.catlitterDeliveryMethodId;

/** Whether CatLitter Delivery is wired up to a WooCommerce method at all. */
const CATLITTER_DELIVERY_ENABLED = CATLITTER_DELIVERY_METHOD_ID.length > 0;

/**
 * WooCommerce hands costs back as bare numeric strings ("350") on rates and as
 * formatted money ("Rs350.00") elsewhere. Strip everything that isn't part of
 * the number so both parse.
 */
const parseRateCost = (cost: string | number | null | undefined): number => {
  if (typeof cost === "number") return cost;
  if (typeof cost !== "string") return NaN;
  return parseFloat(cost.replace(/₨|&nbsp;|,|[^0-9.]/g, ""));
};

/**
 * Rates WooCommerce quoted for the address it currently holds. Assumes a
 * single package - this store ships everything as one.
 */
const quotedRates = (cart: Cart | null | undefined): ShippingRate[] =>
  (cart?.availableShippingMethods?.[0]?.rates ?? []).filter(
    (rate): rate is ShippingRate => !!rate?.id,
  );

/**
 * Matched exactly, with a prefix match as a fallback for a method whose rate
 * ids carry a suffix we don't want to enumerate.
 *
 * On this store the configured value must be the full sub-mode id
 * (`dwbs:2:distance`), NOT the instance prefix `dwbs:2`: that instance quotes
 * `:distance` and `:weight` together, they are our two separate delivery
 * modes, and a prefix would claim both and leave the courier with no rate at
 * all.
 */
const isCatlitterDeliveryRate = (rate: ShippingRate): boolean =>
  CATLITTER_DELIVERY_ENABLED &&
  (rate.id === CATLITTER_DELIVERY_METHOD_ID ||
    rate.id.startsWith(`${CATLITTER_DELIVERY_METHOD_ID}:`));

/**
 * The CatLitter Delivery rate WooCommerce quoted for the current address, or
 * null when the address falls outside the method's configured reach. Its cost
 * is distance-derived, so it is read off the quote rather than configured.
 */
export const resolveCatlitterDeliveryRate = (
  cart: Cart | null | undefined,
): ShippingRate | null =>
  quotedRates(cart).find(isCatlitterDeliveryRate) ?? null;

/**
 * WooCommerce has already decided how this address is delivered: inside our
 * radius it quotes (and forces) the distance rate, outside it quotes only the
 * island-wide courier one.
 */
export const resolveDeliveryType = (
  cart: Cart | null | undefined,
): DeliveryType =>
  resolveCatlitterDeliveryRate(cart) ? "catlitter_delivery" : "courier";

/**
 * A zero-cost rate WooCommerce quoted for the current address - the
 * free-shipping coupon's rate, or a method configured at no charge.
 *
 * Free shipping is a property of the cart, not of the delivery mode, so this
 * is resolved independently of it. Pickup and excluded rates are skipped:
 * they are free by nature, and returning one here would silently turn a
 * delivery into a collection.
 */
export const resolveFreeShippingRate = (
  cart: Cart | null | undefined,
): ShippingRate | null =>
  quotedRates(cart).find(
    (rate) =>
      !isExcludedRate(rate) &&
      (rate.methodId === "free_shipping" || parseRateCost(rate.cost) === 0),
  ) ?? null;

/**
 * The courier rate is not a constant on this store. Its id *and* its label
 * change with the destination - the distance/weight method quotes
 * `dwbs:2:distance` "Local Delivery" inside the Colombo zone and
 * `dwbs:2:weight` "Standard Shipping" outstation - so a hard-coded id is
 * rejected outright ("… is not an available shipping method for shipping
 * package …") and the cart silently keeps the rate quoted for the previous
 * address. Read it off the rates WooCommerce returned for the address it
 * currently holds instead.
 *
 * Pickup, excluded and CatLitter Delivery rates are skipped, so the courier
 * never resolves to a collection or to our own fleet.
 *
 * Assumes a single courier rate among what remains; if a zone ever offers
 * multiple courier choices the customer silently gets `courierRates[0]`
 * (whatever WC ordered first).
 */
export const resolveCourierRate = (
  cart: Cart | null | undefined,
  preferFree: boolean,
): ShippingRate | null => {
  const courierRates = quotedRates(cart).filter(
    (rate) => !isExcludedRate(rate) && !isCatlitterDeliveryRate(rate),
  );

  if (preferFree) {
    const free = courierRates.find(
      (rate) => rate.methodId === "free_shipping" || parseRateCost(rate.cost) === 0,
    );
    if (free) return free;
  }

  return courierRates[0] ?? null;
};
