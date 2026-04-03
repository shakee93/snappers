/**
 * Parse WooCommerce / WPGraphQL money strings (may include HTML) to a number.
 */
export function parseWooMoneyAmount(value: string | null | undefined): number {
  if (value == null || value === "") return NaN;
  const stripped = String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[^0-9.-]/g, "");
  if (stripped === "" || stripped === "-" || stripped === ".") return NaN;
  const n = parseFloat(stripped);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Line is not charged (BOGO free gift, 100% discount, etc.).
 * Prefer `total` (after discounts); fall back to `subtotal` if total is missing.
 */
export function isLineItemFree(
  total?: string | null,
  subtotal?: string | null,
): boolean {
  const totalN = parseWooMoneyAmount(total);
  if (!Number.isNaN(totalN)) return totalN <= 0;
  const subN = parseWooMoneyAmount(subtotal);
  if (!Number.isNaN(subN)) return subN <= 0;
  return false;
}

export function stripHtmlMoney(
  value: string | number | null | undefined,
): string {
  if (value == null || value === "") return "0";
  const s = String(value).replace(/<[^>]*>/g, "").trim();
  return s || "0";
}
