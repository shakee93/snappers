/**
 * Order meta for the map pins the customer dropped at checkout.
 *
 * Note this is *not* what prices the delivery: WooCommerce quotes the rate
 * from the customer address long before an order exists, so these keys are
 * for fulfilment — the shipping team opens `shipping_map_url` to find the
 * door. Keys are only emitted when a pin was actually set.
 */

export interface PinnedAddress {
  latitude: number | null;
  longitude: number | null;
}

export interface OrderMetaEntry {
  key: string;
  value: string;
}

/** Six decimals is ~10cm — more precision than a delivery ever needs. */
const formatCoordinate = (value: number): string => value.toFixed(6);

const hasPin = (
  address: PinnedAddress | null | undefined,
): address is PinnedAddress & { latitude: number; longitude: number } =>
  !!address &&
  typeof address.latitude === "number" &&
  typeof address.longitude === "number";

export const buildPinMetaData = ({
  shipping,
  billing,
  isStorePickup,
}: {
  shipping: PinnedAddress | null | undefined;
  billing: PinnedAddress | null | undefined;
  /** Store pickup has no destination, so a pin would only mislead. */
  isStorePickup: boolean;
}): OrderMetaEntry[] => {
  if (isStorePickup) return [];

  const meta: OrderMetaEntry[] = [];

  if (hasPin(shipping)) {
    const lat = formatCoordinate(shipping.latitude);
    const lng = formatCoordinate(shipping.longitude);
    meta.push(
      { key: "shipping_lat", value: lat },
      { key: "shipping_lng", value: lng },
      {
        key: "shipping_map_url",
        value: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      },
    );
  }

  // Only worth recording when billing was pinned to somewhere else — an
  // identical pair is noise on the order screen.
  if (
    hasPin(billing) &&
    (!hasPin(shipping) ||
      billing.latitude !== shipping.latitude ||
      billing.longitude !== shipping.longitude)
  ) {
    meta.push(
      { key: "billing_lat", value: formatCoordinate(billing.latitude) },
      { key: "billing_lng", value: formatCoordinate(billing.longitude) },
    );
  }

  return meta;
};
