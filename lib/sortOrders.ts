// Sort options driving the Typesense `sort_by` virtual-index convention used
// by react-instantsearch in the storefront listings. Keep in one place so
// desktop (SortOrderFilter) and mobile (MobileFilterSheet) can't drift.

export interface SortOrderOption {
  name: string;
  id: string;
}

// Sort by average rating with reviewCount as the tie-breaker, so a single
// 5-star review can't outrank a 4.9 backed by hundreds.
export const SORT_BEST_RATING_ID =
  "averageRating(missing_values: last):desc,reviewCount(missing_values: last):desc";

// `rawPriceNumber` is a single canonical price (vs. the `rawPrice` array of
// every variation), so range filters and sorts behave deterministically.
export const SORT_PRICE_ASC_ID = "rawPriceNumber(missing_values: last):asc";
export const SORT_PRICE_DESC_ID = "rawPriceNumber(missing_values: last):desc";

export const SORT_ORDER_OPTIONS: SortOrderOption[] = [
  { name: "Name", id: "name:asc" },
  { name: "Most Popular", id: "totalSales(missing_values: last):desc" },
  { name: "Best Rating", id: SORT_BEST_RATING_ID },
  { name: "Newest", id: "databaseId:desc" },
  { name: "Price Low - High", id: SORT_PRICE_ASC_ID },
  { name: "Price High - Low", id: SORT_PRICE_DESC_ID },
];
