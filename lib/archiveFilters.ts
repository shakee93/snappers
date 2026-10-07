import {
  OrderEnum,
  ProductsOrderByEnum,
  StockStatusEnum,
} from "@/graphql/types/graphql";
import {
  SORT_BEST_RATING_ID,
  SORT_NEWEST_ID,
  SORT_PRICE_ASC_ID,
  SORT_PRICE_DESC_ID,
} from "@/lib/sortOrders";

export const ARCHIVE_PRICE_MIN = 0;
export const ARCHIVE_PRICE_MAX = 500_000;

/** Shop archive page size — divisible by 2, 3, and 4 so the last grid row is never a single card. */
export const ARCHIVE_PRODUCTS_PER_PAGE = 48;

export interface ArchiveSortOption {
  id: string;
  label: string;
  field: ProductsOrderByEnum;
  order: OrderEnum;
}

/** Sort options exposed on /deals — popular/rating are no-ops client-side. */
export const DEALS_ARCHIVE_SORT_OPTIONS: ArchiveSortOption[] = [
  {
    id: "newest",
    label: "Newest",
    field: ProductsOrderByEnum.Date,
    order: OrderEnum.Desc,
  },
  {
    id: "price-asc",
    label: "Price: Low to High",
    field: ProductsOrderByEnum.Price,
    order: OrderEnum.Asc,
  },
  {
    id: "price-desc",
    label: "Price: High to Low",
    field: ProductsOrderByEnum.Price,
    order: OrderEnum.Desc,
  },
  {
    id: "name",
    label: "Name",
    field: ProductsOrderByEnum.Name,
    order: OrderEnum.Asc,
  },
];

export const ARCHIVE_SORT_OPTIONS: ArchiveSortOption[] = [
  {
    id: "newest",
    label: "Newest",
    field: ProductsOrderByEnum.Date,
    order: OrderEnum.Desc,
  },
  {
    id: "price-asc",
    label: "Price: Low to High",
    field: ProductsOrderByEnum.Price,
    order: OrderEnum.Asc,
  },
  {
    id: "price-desc",
    label: "Price: High to Low",
    field: ProductsOrderByEnum.Price,
    order: OrderEnum.Desc,
  },
  {
    id: "name",
    label: "Name",
    field: ProductsOrderByEnum.Name,
    order: OrderEnum.Asc,
  },
  {
    id: "popular",
    label: "Most Popular",
    field: ProductsOrderByEnum.TotalSales,
    order: OrderEnum.Desc,
  },
  {
    id: "rating",
    label: "Best Rating",
    field: ProductsOrderByEnum.Rating,
    order: OrderEnum.Desc,
  },
];

export const DEFAULT_ARCHIVE_SORT = ARCHIVE_SORT_OPTIONS[0].id;

export interface ArchiveFilterState {
  onSale: boolean;
  inStock: boolean;
  minPrice: number;
  maxPrice: number;
  sort: string;
  /** Selected root category databaseIds (shop sidebar); empty = all. */
  categoryIds: number[];
}

export const DEFAULT_ARCHIVE_FILTERS: ArchiveFilterState = {
  onSale: false,
  inStock: false,
  minPrice: ARCHIVE_PRICE_MIN,
  maxPrice: ARCHIVE_PRICE_MAX,
  sort: DEFAULT_ARCHIVE_SORT,
  categoryIds: [],
};

export type ArchiveFilterCategoryOption = {
  databaseId: number;
  name: string;
  slug?: string | null;
};

export function parseCategoryIdsParam(value: string | null): number[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/** GraphQL `categoryIdIn` from sidebar selection + optional fixed archive scope. */
export function resolveArchiveCategoryIdIn(
  filterCategoryIds: number[],
  pageCategoryIds: number[] | undefined,
  categoryScopeById: Record<number, number[]> | undefined,
): number[] | undefined {
  if (pageCategoryIds && pageCategoryIds.length > 0) {
    return pageCategoryIds;
  }
  if (!filterCategoryIds.length) return undefined;
  if (!categoryScopeById || Object.keys(categoryScopeById).length === 0) {
    return filterCategoryIds;
  }
  const scoped = filterCategoryIds.flatMap(
    (id) => categoryScopeById[id] ?? [id],
  );
  return Array.from(new Set(scoped));
}

/** /deals — always query on-sale; default to in-stock unless URL overrides. */
export const DEALS_LOCKED_FILTERS: Partial<ArchiveFilterState> = { onSale: true };
export const DEALS_FILTER_DEFAULTS: Partial<ArchiveFilterState> = {
  inStock: true,
};

function parseBooleanParam(
  value: string | null,
  defaultValue: boolean,
): boolean {
  if (value === null) return defaultValue;
  return value === "1" || value === "true";
}

function parsePriceParam(
  value: string | null,
  fallback: number,
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, ARCHIVE_PRICE_MIN), ARCHIVE_PRICE_MAX);
}

export function parseArchiveFilters(
  searchParams: URLSearchParams,
  defaults: Partial<ArchiveFilterState> = {},
  locked: Partial<ArchiveFilterState> = {},
  sortOptions: ArchiveSortOption[] = ARCHIVE_SORT_OPTIONS,
): ArchiveFilterState {
  const sort = searchParams.get("sort");
  const validSort = sortOptions.some((option) => option.id === sort);

  const parsed: ArchiveFilterState = {
    onSale: parseBooleanParam(
      searchParams.get("on_sale"),
      defaults.onSale ?? false,
    ),
    inStock: parseBooleanParam(
      searchParams.get("in_stock"),
      defaults.inStock ?? false,
    ),
    minPrice: parsePriceParam(
      searchParams.get("min_price"),
      defaults.minPrice ?? ARCHIVE_PRICE_MIN,
    ),
    maxPrice: parsePriceParam(
      searchParams.get("max_price"),
      defaults.maxPrice ?? ARCHIVE_PRICE_MAX,
    ),
    sort: validSort && sort ? sort : (defaults.sort ?? DEFAULT_ARCHIVE_SORT),
    categoryIds: parseCategoryIdsParam(searchParams.get("categories")),
  };

  return { ...parsed, ...locked };
}

export function buildArchiveFilterSearchParams(
  filters: ArchiveFilterState,
  locked: Partial<ArchiveFilterState> = {},
  defaults: Partial<ArchiveFilterState> = {},
): string {
  const params = new URLSearchParams();
  const base: ArchiveFilterState = {
    ...DEFAULT_ARCHIVE_FILTERS,
    ...defaults,
    ...locked,
  };

  if (filters.onSale !== base.onSale && locked.onSale === undefined) {
    params.set("on_sale", filters.onSale ? "true" : "false");
  }

  if (filters.inStock !== base.inStock && locked.inStock === undefined) {
    params.set("in_stock", filters.inStock ? "true" : "false");
  }

  if (filters.minPrice !== base.minPrice) {
    params.set("min_price", String(filters.minPrice));
  }

  if (filters.maxPrice !== base.maxPrice) {
    params.set("max_price", String(filters.maxPrice));
  }

  if (filters.sort !== base.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.categoryIds.length > 0) {
    params.set("categories", filters.categoryIds.join(","));
  }

  return params.toString();
}

export function recordToURLSearchParams(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
    } else {
      params.set(key, value);
    }
  }

  return params;
}

export interface ArchiveProductsQueryVariables {
  first: number;
  after?: string | null;
  categoryIdIn?: number[];
  stockStatus?: StockStatusEnum[];
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  orderby: Array<{ field: ProductsOrderByEnum; order: OrderEnum }>;
}

export function toArchiveProductsVariables(
  filters: ArchiveFilterState,
  categoryIds: number[] | undefined,
  first: number,
  locked: Partial<ArchiveFilterState> = {},
): ArchiveProductsQueryVariables {
  const effective: ArchiveFilterState = { ...filters, ...locked };

  const sortOption =
    ARCHIVE_SORT_OPTIONS.find((option) => option.id === effective.sort) ??
    ARCHIVE_SORT_OPTIONS[0];

  const variables: ArchiveProductsQueryVariables = {
    first,
    orderby: [{ field: sortOption.field, order: sortOption.order }],
  };

  if (categoryIds && categoryIds.length > 0) {
    variables.categoryIdIn = categoryIds;
  }

  if (effective.inStock) {
    variables.stockStatus = [StockStatusEnum.InStock];
  }

  if (effective.onSale) {
    variables.onSale = true;
  }

  if (effective.minPrice > ARCHIVE_PRICE_MIN) {
    variables.minPrice = effective.minPrice;
  }

  if (effective.maxPrice < ARCHIVE_PRICE_MAX) {
    variables.maxPrice = effective.maxPrice;
  }

  return variables;
}

/** Parse a price input; empty string restores the bound to its default. */
export function parseArchivePriceInput(
  value: string,
  bound: "min" | "max",
): number {
  if (value.trim() === "") {
    return bound === "min" ? ARCHIVE_PRICE_MIN : ARCHIVE_PRICE_MAX;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return bound === "min" ? ARCHIVE_PRICE_MIN : ARCHIVE_PRICE_MAX;
  }
  return Math.min(Math.max(parsed, ARCHIVE_PRICE_MIN), ARCHIVE_PRICE_MAX);
}

export function normalizePriceRange(
  minPrice: number,
  maxPrice: number,
): { minPrice: number; maxPrice: number } {
  const min = Math.min(
    Math.max(minPrice, ARCHIVE_PRICE_MIN),
    ARCHIVE_PRICE_MAX,
  );
  const max = Math.min(
    Math.max(maxPrice, ARCHIVE_PRICE_MIN),
    ARCHIVE_PRICE_MAX,
  );

  if (min <= max) {
    return { minPrice: min, maxPrice: max };
  }

  return { minPrice: max, maxPrice: min };
}

const ARCHIVE_TO_TYPESENSE_SORT: Record<string, string> = {
  newest: SORT_NEWEST_ID,
  "price-asc": SORT_PRICE_ASC_ID,
  "price-desc": SORT_PRICE_DESC_ID,
  name: "name:asc",
  popular: "totalSales(missing_values: last):desc",
  rating: SORT_BEST_RATING_ID,
};

export function archiveSortToTypesense(sortId: string): string {
  return ARCHIVE_TO_TYPESENSE_SORT[sortId] ?? SORT_NEWEST_ID;
}

export function typesenseSortToArchive(sort: string): string {
  if (!sort) return DEFAULT_ARCHIVE_SORT;
  const match = Object.entries(ARCHIVE_TO_TYPESENSE_SORT).find(
    ([, typesenseId]) => typesenseId === sort,
  );
  return match?.[0] ?? DEFAULT_ARCHIVE_SORT;
}
