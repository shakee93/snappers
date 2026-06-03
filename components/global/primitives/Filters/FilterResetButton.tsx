"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInstantSearch } from "react-instantsearch";
import { UiState } from "instantsearch.js";
import { useStore } from "@/store/store";
import { hasActiveSidebarFilters } from "@/lib/sidebarFilters";
import { PRICE_RANGE } from "@/components/global/primitives/Filters/PriceFilter";
import { VALID_DEAL_FILTER_TYPES, DealFilterType } from "@/lib/dealFilters";

type SearchUiState = UiState & {
  product?: {
    query?: string;
    page?: number;
    categories?: number[];
    brands?: number[];
    priceRange?: number[];
    on_sale?: boolean;
    in_stock?: boolean;
    sort?: string;
    variations?: Record<string, string[]>;
  };
};

interface FilterResetButtonProps {
  defaultSort?: string;
  /** When true, also clears the /deals `?filter=` param on reset. */
  resetDealsFilter?: boolean;
  ignoreInStock?: boolean;
  /** Also clears the InstantSearch query and header search input. */
  resetSearchQuery?: boolean;
  className?: string;
}

const FilterResetButton = ({
  defaultSort = "",
  resetDealsFilter = false,
  ignoreInStock = false,
  resetSearchQuery = false,
  className = "",
}: FilterResetButtonProps) => {
  const { sidebar, resetSidebarFilters, search, setSearch } = useStore();
  const { uiState, setUiState } = useInstantSearch<SearchUiState>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasDealsFilter = useMemo(() => {
    if (!resetDealsFilter) return false;
    const raw = searchParams.get("filter");
    if (!raw) return false;
    return raw
      .split(",")
      .some((v) => VALID_DEAL_FILTER_TYPES.includes(v.trim() as DealFilterType));
  }, [resetDealsFilter, searchParams]);

  const hasSearchQuery = useMemo(() => {
    if (!resetSearchQuery) return false;
    const urlQuery = searchParams.get("query");
    const uiQuery = uiState?.product?.query;
    return Boolean(urlQuery) || Boolean(search) || Boolean(uiQuery);
  }, [resetSearchQuery, searchParams, search, uiState?.product?.query]);

  const hasActiveFilters =
    hasActiveSidebarFilters(sidebar, { defaultSort, ignoreInStock }) ||
    hasDealsFilter ||
    hasSearchQuery;

  if (!hasActiveFilters) {
    return null;
  }

  const handleReset = () => {
    resetSidebarFilters(defaultSort);

    if (resetSearchQuery) {
      setSearch("");
      setUiState((prev) => ({
        ...prev,
        product: {
          ...(prev.product || {}),
          query: "",
          page: 1,
          categories: [],
          brands: [],
          priceRange: PRICE_RANGE,
          on_sale: false,
          in_stock: false,
          sort: defaultSort,
          variations: {},
        },
      }));
    }

    if (resetDealsFilter && hasDealsFilter) {
      router.push(pathname, { scroll: false });
    }
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className={`text-sm font-medium text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline ${className}`}
    >
      Reset
    </button>
  );
};

export default FilterResetButton;
