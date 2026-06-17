/** Decode common HTML entities from WooCommerce / WPGraphQL string fields. */
export function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'");
}
