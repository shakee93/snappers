/**
 * Typesense schema differs per tenant. GQ indexes nested `productTags.nodes.*`
 * and exposes `productTags` in `query_by`; Catlitter's index currently does not.
 * Gate those features here so InstantSearch queries stay compatible.
 */

const typesenseHost = (
  process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? ""
).toLowerCase();

/** Nested tag facets (`productTags.nodes.slug`) are available on the GQ index. */
export const typesenseHasProductTagFacets =
  process.env.NEXT_PUBLIC_TYPESENSE_PRODUCT_TAG_FACETS === "true" ||
  typesenseHost.includes("gqmobiles");

/** Fields passed to Typesense `query_by`. */
export const typesenseQueryBy =
  process.env.NEXT_PUBLIC_TYPESENSE_QUERY_BY ??
  (typesenseHasProductTagFacets
    ? "name, description, productTags"
    : "name, description");

export function buildPreOrderExclusionFilter(): string | null {
  return typesenseHasProductTagFacets
    ? "productTags.nodes.slug:!=pre-order"
    : null;
}

export function buildInStockTypesenseFilter(
  includePreOrderExclusion: boolean
): string {
  const parts = ["stockStatus:IN_STOCK"];
  if (includePreOrderExclusion) {
    const preOrderFilter = buildPreOrderExclusionFilter();
    if (preOrderFilter) parts.push(preOrderFilter);
  }
  return parts.join(" && ");
}

export function buildDealTagsFilter(tags: string[]): string | null {
  if (!typesenseHasProductTagFacets || tags.length === 0) return null;
  return `productTags.nodes.slug:[${tags.join(",")}]`;
}

export function buildSingleTagFilter(tag: string): string | null {
  if (!typesenseHasProductTagFacets || !tag) return null;
  return `productTags.nodes.slug:${tag}`;
}
