import { siteConfig } from "@/site.config";

export const currencySymbol = siteConfig.locale.currencySymbol;
export const currencyCode = siteConfig.locale.currencyCode;

/**
 * Format a numeric amount as a currency string, e.g. `"LKR 1,234.00"`.
 * Reads the symbol from `siteConfig.locale` so a fork changes currency in
 * one place. Replaces inline `Rs ${new Intl.NumberFormat(...)}` formatters.
 */
export function formatPrice(
  amount: number,
  { decimals = 2 }: { decimals?: number } = {},
): string {
  // Guard against NaN / undefined slipping in (e.g. unparsed price strings) so
  // users never see "LKR NaN".
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${currencySymbol} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeAmount)}`;
}

/**
 * WooCommerce bakes the store currency symbol into its price strings. Variable
 * products render a RANGE with two symbols (e.g. "Rs1,950.00 - Rs2,350.00"), so
 * swap EVERY Woo "Rs"/rupee-sign token plus its trailing separator for the
 * configured `currencySymbol` — not just the leading one. Safe on the HTML
 * strings the PDP/QuickView render via `dangerouslySetInnerHTML`, and
 * idempotent (it only matches the Woo token).
 */
export function toDisplayCurrency(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(
    /(?:₨|Rs\.?)(?:\s|&nbsp;)*/gi,
    `${currencySymbol} `,
  );
}
