/**
 * Shared deal-filter types. The UI tab slugs (`DealFilterType`) and the
 * underlying WP tag slugs (`DealTagSlug`) are intentionally separate —
 * the URL uses short tab labels (`offers`) while the GraphQL/Typesense
 * query needs the full WP tag slug (`bogo-offer`).
 */

export type DealFilterType = "clearance" | "offers" | "free-shipping";

export type DealTagSlug = "clearance" | "bogo-offer" | "free-shipping";

export const VALID_DEAL_FILTER_TYPES: readonly DealFilterType[] = [
  "clearance",
  "offers",
  "free-shipping",
] as const;

export const DEAL_FILTER_TO_TAG: Readonly<Record<DealFilterType, DealTagSlug>> = {
  clearance: "clearance",
  offers: "bogo-offer",
  "free-shipping": "free-shipping",
} as const;
