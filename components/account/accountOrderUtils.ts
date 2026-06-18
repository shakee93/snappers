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
