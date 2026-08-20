"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { currencyCode } from "@/lib/formatPrice";
import {
  ARCHIVE_PRICE_MAX,
  ARCHIVE_PRICE_MIN,
  ARCHIVE_SORT_OPTIONS,
  DEFAULT_ARCHIVE_FILTERS,
  ArchiveFilterState,
  buildArchiveFilterSearchParams,
  normalizePriceRange,
  parseArchivePriceInput,
} from "@/lib/archiveFilters";
import {
  filterCheckboxLabelClassName,
  filterFieldLabelClassName,
  filterPanelTitleClassName,
  filterResetClassName,
} from "@/components/global/primitives/Filters/filterStyles";
import FilterSelect from "@/components/global/primitives/Filters/FilterSelect";

interface ArchiveSidebarPanelProps {
  filters: ArchiveFilterState;
  onChange: (next: Partial<ArchiveFilterState>) => void;
  lockedFilters?: Partial<ArchiveFilterState>;
}

const priceInputWrapperClassName =
  "flex h-9 min-w-0 w-full items-center gap-1 rounded-lg border border-[#E8E8E8] bg-white px-2 focus-within:border-header-action focus-within:ring-2 focus-within:ring-header-action/20";

const priceInputClassName =
  "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-9 text-neutral-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none";

const ArchiveSidebarPanel = ({
  filters,
  onChange,
  lockedFilters,
}: ArchiveSidebarPanelProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const showOnSale = lockedFilters?.onSale === undefined;
  const showInStock = lockedFilters?.inStock === undefined;

  const [minPrice, setMinPrice] = useState(String(filters.minPrice));
  const [maxPrice, setMaxPrice] = useState(String(filters.maxPrice));

  const commitPriceRange = () => {
    const next = normalizePriceRange(
      parseArchivePriceInput(minPrice, "min"),
      parseArchivePriceInput(maxPrice, "max"),
    );
    onChange(next);
  };

  const handleReset = () => {
    const resetState: ArchiveFilterState = {
      ...DEFAULT_ARCHIVE_FILTERS,
      ...lockedFilters,
    };
    const query = buildArchiveFilterSearchParams(resetState, lockedFilters);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-between border-b border-neutral-200 pb-2">
        <span className={filterPanelTitleClassName}>Filters</span>
        <button type="button" onClick={handleReset} className={filterResetClassName}>
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="archive-sidebar-sort" className={filterFieldLabelClassName}>
          Sort
        </label>
        <FilterSelect
          id="archive-sidebar-sort"
          aria-label="Sort products"
          className="w-full"
          buttonClassName="h-9 w-full px-2"
          value={filters.sort}
          options={ARCHIVE_SORT_OPTIONS.map((option) => ({
            id: option.id,
            label: option.label,
          }))}
          onChange={(sort) => onChange({ sort })}
        />
      </div>

      {(showOnSale || showInStock) && (
        <div className="space-y-3 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3">
          {showOnSale ? (
            <Checkbox
              name="archive-sidebar-on-sale"
              label="On sale"
              labelPosition="after"
              checked={filters.onSale}
              onChange={(checked) => onChange({ onSale: checked })}
              labelClassName={filterCheckboxLabelClassName}
            />
          ) : null}
          {showInStock ? (
            <Checkbox
              name="archive-sidebar-in-stock"
              label="In stock"
              labelPosition="after"
              checked={filters.inStock}
              onChange={(checked) => onChange({ inStock: checked })}
              labelClassName={filterCheckboxLabelClassName}
            />
          ) : null}
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3">
        <span className={filterFieldLabelClassName}>Price</span>
        <div className="flex items-center gap-1.5">
          <div className={priceInputWrapperClassName}>
            <span className="flex h-full shrink-0 items-center text-xs font-medium leading-none text-header-green">
              {currencyCode}
            </span>
            <input
              id="archive-sidebar-min-price"
              type="number"
              min={ARCHIVE_PRICE_MIN}
              max={ARCHIVE_PRICE_MAX}
              inputMode="numeric"
              aria-label="Minimum price"
              className={priceInputClassName}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              onBlur={commitPriceRange}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitPriceRange();
              }}
            />
          </div>
          <span className="text-sm text-neutral-400">–</span>
          <div className={priceInputWrapperClassName}>
            <span className="flex h-full shrink-0 items-center text-xs font-medium leading-none text-header-green">
              {currencyCode}
            </span>
            <input
              id="archive-sidebar-max-price"
              type="number"
              min={ARCHIVE_PRICE_MIN}
              max={ARCHIVE_PRICE_MAX}
              inputMode="numeric"
              aria-label="Maximum price"
              className={priceInputClassName}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              onBlur={commitPriceRange}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitPriceRange();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveSidebarPanel;
