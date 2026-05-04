export const HIDDEN_PRODUCT_SLUGS = new Set(["demo"]);

export function filterHiddenProducts<T extends { slug?: string | null }>(items: T[]): T[] {
  return items.filter((item) => !HIDDEN_PRODUCT_SLUGS.has((item.slug ?? "").toLowerCase()));
}
