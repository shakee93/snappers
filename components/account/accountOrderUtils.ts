import { parseWooMoneyAmount } from "@/lib/cartLinePricing";
import { decodeHtmlEntities } from "@/lib/decodeHtmlEntities";
import { formatPrice } from "@/lib/formatPrice";
import type { MyOrderLineItem } from "@/graphql/defs/order";

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  payhere: "PayHere",
  bacs: "Bank Transfer",
  banktransfer: "Bank Transfer",
};

export function formatOrderMoney(value: string | null | undefined) {
  return formatPrice(parseWooMoneyAmount(value));
}

export function formatOrderSummaryDate(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatOrderDate(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  store_pickup: "Store Pickup",
  flash_delivery: "Flash Delivery (Uber/PickMe)",
};

type ShippingLineLabelSource = {
  methodTitle?: string | null;
  shippingMethod?: { id?: string | null; title?: string | null } | null;
};

export type OrderShippingLabelSource = {
  shippingMethodLabel?: string | null;
  deliveryType?: string | null;
  shippingLines?: {
    nodes?: Array<ShippingLineLabelSource | null> | null;
  } | null;
  customerNote?: string | null;
  metaData?: Array<{ key?: string | null; value?: string | null } | null> | null;
};

function isStorePickupCustomerNote(note: string | null | undefined): boolean {
  if (!note) return false;
  const normalized = note.toLowerCase();
  return (
    normalized.includes("pickup location") ||
    normalized.includes("store pickup")
  );
}

function deliveryTypeFromMeta(
  metaData?: OrderShippingLabelSource["metaData"],
): string | null {
  const entry = metaData?.find((item) => item?.key === "delivery_type");
  return entry?.value?.trim() || null;
}

function hasShippingLineTitle(
  shippingLines?: OrderShippingLabelSource["shippingLines"],
): boolean {
  return Boolean(
    shippingLines?.nodes?.some((line) => line?.methodTitle?.trim()),
  );
}

function synthesizeShippingLines(label: string): OrderShippingLabelSource["shippingLines"] {
  return { nodes: [{ methodTitle: label }] };
}

/** Persist checkout delivery info for the thank-you page when WC omits shipping lines. */
export function enrichCheckoutOrderStorage<
  T extends {
    checkout?: {
      order?: OrderShippingLabelSource & Record<string, unknown>;
      deliveryType?: string;
      shippingMethodLabel?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  },
>(mutationData: T, deliveryType: string | null, shippingMethodLabel: string): T {
  const checkout = mutationData.checkout;
  if (!checkout?.order) return mutationData;

  const shippingLines = hasShippingLineTitle(checkout.order.shippingLines)
    ? checkout.order.shippingLines
    : synthesizeShippingLines(shippingMethodLabel);

  return {
    ...mutationData,
    checkout: {
      ...checkout,
      deliveryType: deliveryType ?? undefined,
      shippingMethodLabel,
      order: {
        ...checkout.order,
        deliveryType: deliveryType ?? undefined,
        shippingMethodLabel,
        shippingLines,
      },
    },
  };
}

/** Merge API order data with checkout localStorage for thank-you display. */
export function mergeThankYouOrderData(
  queryData?: { order?: OrderShippingLabelSource & Record<string, unknown> } | null,
  localStoragePayload?: {
    checkout?: {
      order?: OrderShippingLabelSource & Record<string, unknown>;
      deliveryType?: string;
      shippingMethodLabel?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  } | null,
  orderId?: string | null,
) {
  const checkout = localStoragePayload?.checkout;
  const queryOrder = queryData?.order;
  const storedOrder = checkout?.order;

  if (!queryOrder && !storedOrder) return null;

  let shippingMethodLabel =
    queryOrder?.shippingMethodLabel ??
    checkout?.shippingMethodLabel ??
    storedOrder?.shippingMethodLabel ??
    null;

  let deliveryType =
    queryOrder?.deliveryType ??
    checkout?.deliveryType ??
    storedOrder?.deliveryType ??
    null;

  if (
    !shippingMethodLabel &&
    orderId &&
    typeof window !== "undefined"
  ) {
    shippingMethodLabel =
      sessionStorage.getItem(`order_shipping_label_${orderId}`) ?? null;
  }

  if (!deliveryType && orderId && typeof window !== "undefined") {
    deliveryType =
      sessionStorage.getItem(`order_delivery_type_${orderId}`) ?? null;
  }

  const shippingLines = hasShippingLineTitle(queryOrder?.shippingLines)
    ? queryOrder?.shippingLines
    : hasShippingLineTitle(storedOrder?.shippingLines)
      ? storedOrder?.shippingLines
      : shippingMethodLabel
        ? synthesizeShippingLines(shippingMethodLabel)
        : queryOrder?.shippingLines ?? storedOrder?.shippingLines;

  const mergedOrder = {
    ...(storedOrder ?? {}),
    ...(queryOrder ?? {}),
    deliveryType,
    shippingMethodLabel,
    shippingLines,
    customerNote: queryOrder?.customerNote || storedOrder?.customerNote,
    metaData: queryOrder?.metaData?.length
      ? queryOrder.metaData
      : storedOrder?.metaData,
  } as OrderShippingLabelSource & Record<string, unknown>;

  return { order: mergedOrder };
}

/** Label for the shipping row on order summaries (thank-you page, etc.). */
export function getOrderShippingRowLabel(order: OrderShippingLabelSource): string {
  if (order.shippingMethodLabel?.trim()) {
    return decodeHtmlEntities(order.shippingMethodLabel.trim());
  }

  const deliveryType =
    order.deliveryType?.trim() || deliveryTypeFromMeta(order.metaData);
  if (deliveryType && DELIVERY_TYPE_LABELS[deliveryType]) {
    return DELIVERY_TYPE_LABELS[deliveryType];
  }

  const line = order.shippingLines?.nodes?.[0];
  const methodTitle = line?.methodTitle?.trim();
  if (methodTitle) {
    return decodeHtmlEntities(methodTitle);
  }

  const methodId = line?.shippingMethod?.id?.toLowerCase() ?? "";
  if (
    methodId.includes("pickup_location") ||
    methodId.includes("local_pickup")
  ) {
    return "Store Pickup";
  }

  const shippingMethodTitle = line?.shippingMethod?.title?.trim();
  if (shippingMethodTitle) {
    return decodeHtmlEntities(shippingMethodTitle);
  }

  if (isStorePickupCustomerNote(order.customerNote)) {
    return "Store Pickup";
  }

  return "Shipping";
}

export function formatPaymentMethod(
  method: string | null | undefined,
  title?: string | null
) {
  if (title?.trim()) return decodeHtmlEntities(title);
  if (!method) return "—";
  return PAYMENT_LABELS[method.toLowerCase()] ?? method.toUpperCase();
}

export function formatStatus(status: string | null | undefined) {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

/** Human-readable variation summary for an order line item. */
export function formatLineItemVariation(item: MyOrderLineItem): string | null {
  const attributes = (item.variation?.node?.attributes?.nodes ?? []).filter(
    (attr): attr is NonNullable<typeof attr> =>
      !!attr?.label?.trim() && !!attr?.value?.trim(),
  );

  if (attributes.length > 0) {
    return attributes
      .map((attr) => `${attr.label}: ${attr.value}`)
      .join(" · ");
  }

  const variationName = item.variation?.node?.name?.trim();
  const productName = item.product?.node?.name?.trim();
  if (variationName && variationName !== productName) {
    return variationName;
  }

  return null;
}

export function statusBadgeClass(status: string | null | undefined) {
  switch (status) {
    case "CANCELLED":
    case "FAILED":
      return "bg-red-50 text-red-700";
    case "COMPLETED":
      return "bg-green-50 text-green-700";
    default:
      return "bg-header-action/25 text-header-green";
  }
}
