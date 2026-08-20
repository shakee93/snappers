"use client";

import { useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { currencyCode } from "@/lib/formatPrice";
import {
  ARCHIVE_PRICE_MAX,
  ARCHIVE_PRICE_MIN,
  ARCHIVE_SORT_OPTIONS,
  ArchiveFilterState,
  ArchiveSortOption,
  normalizePriceRange,
  parseArchivePriceInput,
} from "@/lib/archiveFilters";
import {
  filterCheckboxLabelClassName,
  filterFieldLabelClassName,
} from "@/components/global/primitives/Filters/filterStyles";
import FilterSelect from "@/components/global/primitives/Filters/FilterSelect";
import { cn } from "@/lib/utils";

interface ArchiveFilterBarProps {
  filters: ArchiveFilterState;
  onChange: (next: Partial<ArchiveFilterState>) => void;
  className?: string;
  /** Locked filters are hidden — the page always applies them server-side. */
  lockedFilters?: Partial<ArchiveFilterState>;
  sortOptions?: ArchiveSortOption[];
}

const priceInputWrapperClassName =
  "flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg border border-[#E8E8E8] bg-white px-2 focus-within:border-header-action focus-within:ring-2 focus-within:ring-header-action/20";

const priceInputClassName =
  "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-9 text-neutral-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none";

const ArchivePriceInput = ({
  id,
  label,
  value,
  onChange,
  onCommit,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
}) => (
  <div className={priceInputWrapperClassName}>
    <span className="flex h-full shrink-0 items-center text-xs font-medium leading-none text-header-green">
      {currencyCode}
    </span>
    <input
      id={id}
      type="number"
      min={ARCHIVE_PRICE_MIN}
      max={ARCHIVE_PRICE_MAX}
      inputMode="numeric"
      aria-label={label}
      className={priceInputClassName}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCommit}
      onKeyDown={(event) => {
        if (event.key === "Enter") onCommit();
      }}
    />
  </div>
);

const ArchivePriceRangeInputs = ({
  minPrice: committedMin,
  maxPrice: committedMax,
  onChange,
}: {
  minPrice: number;
  maxPrice: number;
  onChange: (next: Partial<ArchiveFilterState>) => void;
}) => {
  const [minPrice, setMinPrice] = useState(String(committedMin));
  const [maxPrice, setMaxPrice] = useState(String(committedMax));

  const commitPriceRange = () => {
    const next = normalizePriceRange(
      parseArchivePriceInput(minPrice, "min"),
      parseArchivePriceInput(maxPrice, "max"),
    );
    onChange(next);
  };

  return (
    <div className="flex w-full items-center gap-3">
      <span className={filterFieldLabelClassName}>Price</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <ArchivePriceInput
          id="archive-min-price"
          label="Minimum price"
          value={minPrice}
          onChange={setMinPrice}
          onCommit={commitPriceRange}
        />
        <span className="text-sm text-neutral-400">–</span>
        <ArchivePriceInput
          id="archive-max-price"
          label="Maximum price"
          value={maxPrice}
          onChange={setMaxPrice}
          onCommit={commitPriceRange}
        />
      </div>
    </div>
  );
};

const filterRowDividerClassName =
  "h-6 w-px shrink-0 bg-[#E8E8E8] lg:hidden";

const ArchiveFilterBar = ({
  filters,
  onChange,
  className,
  lockedFilters,
  sortOptions = ARCHIVE_SORT_OPTIONS,
}: ArchiveFilterBarProps) => {
  const showOnSale = lockedFilters?.onSale === undefined;
  const showInStock = lockedFilters?.inStock === undefined;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E8E8E8] bg-white p-3 sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-center lg:gap-4">
        <div className="flex w-full items-center gap-2 border-b border-[#E8E8E8] pb-4 sm:gap-3 lg:gap-4 lg:border-0 lg:pb-0">
          {showOnSale ? (
            <Checkbox
              name="archive-on-sale"
              label="On sale"
              labelPosition="after"
              className="shrink-0"
              checked={filters.onSale}
              onChange={(checked) => onChange({ onSale: checked })}
              labelClassName={filterCheckboxLabelClassName}
            />
          ) : null}
          {showOnSale && showInStock ? (
            <span className={filterRowDividerClassName} aria-hidden />
          ) : null}
          {showInStock ? (
            <Checkbox
              name="archive-in-stock"
              label="In stock"
              labelPosition="after"
              className="shrink-0"
              checked={filters.inStock}
              onChange={(checked) => onChange({ inStock: checked })}
              labelClassName={filterCheckboxLabelClassName}
            />
          ) : null}
          {(showOnSale || showInStock) ? (
            <span className={filterRowDividerClassName} aria-hidden />
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:hidden">
            <label
              htmlFor="archive-sort-mobile"
              className={filterFieldLabelClassName}
            >
              Sort
            </label>
            <FilterSelect
              id="archive-sort-mobile"
              aria-label="Sort products"
              className="min-w-0 flex-1"
              buttonClassName="h-9 w-full min-w-0 px-2"
              value={filters.sort}
              options={sortOptions.map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              onChange={(sort) => onChange({ sort })}
            />
          </div>
        </div>

        <div className="w-full">
          <ArchivePriceRangeInputs
            key={`${filters.minPrice}-${filters.maxPrice}`}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onChange={onChange}
          />
        </div>

        <div className="hidden items-center gap-3 lg:flex lg:justify-end">
          <label htmlFor="archive-sort" className={filterFieldLabelClassName}>
            Sort
          </label>
          <FilterSelect
            id="archive-sort"
            aria-label="Sort products"
            value={filters.sort}
            options={sortOptions.map((option) => ({
              id: option.id,
              label: option.label,
            }))}
            onChange={(sort) => onChange({ sort })}
          />
        </div>
      </div>
    </div>
  );
};

export default ArchiveFilterBar;
