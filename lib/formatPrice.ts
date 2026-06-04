import { siteConfig } from "@/site.config";

export const currencySymbol = siteConfig.locale.currencySymbol;
export const currencyCode = siteConfig.locale.currencyCode;

/**
 * Format a numeric amount as a currency string, e.g. `"Rs 1,234.00"`.
 * Reads the symbol from `siteConfig.locale` so a fork changes currency in
 * one place. Replaces inline `Rs ${new Intl.NumberFormat(...)}` formatters.
 */
export function formatPrice(
  amount: number,
  { decimals = 2 }: { decimals?: number } = {},
): string {
  // Guard against NaN / undefined slipping in (e.g. unparsed price strings) so
  // users never see "Rs NaN".
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${currencySymbol} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeAmount)}`;
}
