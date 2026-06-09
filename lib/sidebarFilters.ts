import { PRICE_RANGE } from "@/components/global/primitives/Filters/PriceFilter";

export type SidebarFilterState = {
  categories: number[];
  brands: number[];
  priceRange: number[];
  on_sale: boolean;
  in_stock: boolean;
  sort: string;
  variations: Record<string, string[]>;
};

export function hasActiveSidebarFilters(
  sidebar: SidebarFilterState,
  options?: { defaultSort?: string; ignoreInStock?: boolean }
): boolean {
  const defaultSort = options?.defaultSort ?? "";

  if (sidebar.categories.length > 0) return true;
  if (sidebar.brands.length > 0) return true;
  if (sidebar.on_sale) return true;
  if (!options?.ignoreInStock && sidebar.in_stock) return true;
  if (sidebar.priceRange.join("") !== PRICE_RANGE.join("")) return true;
  if (sidebar.sort && sidebar.sort !== defaultSort) return true;
  if (Object.values(sidebar.variations).some((values) => values.length > 0)) {
    return true;
  }

  return false;
}

export function getDefaultSidebarFilters(defaultSort = ""): SidebarFilterState {
  return {
    categories: [],
    brands: [],
    priceRange: PRICE_RANGE,
    on_sale: false,
    in_stock: false,
    sort: defaultSort,
    variations: {},
  };
}
