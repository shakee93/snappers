"use client";

import { usePathname, useRouter } from "next/navigation";
import Checkbox from "@/shared/Checkbox/Checkbox";
import {
  ARCHIVE_SORT_OPTIONS,
  DEFAULT_ARCHIVE_FILTERS,
  ArchiveFilterState,
  ArchiveFilterCategoryOption,
  ArchiveSortOption,
  buildArchiveFilterSearchParams,
} from "@/lib/archiveFilters";
import ArchiveSidebarCategoryFilter from "@/components/global/primitives/archive/ArchiveSidebarCategoryFilter";
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
  filterDefaults?: Partial<ArchiveFilterState>;
  sortOptions?: ArchiveSortOption[];
  filterCategories?: ArchiveFilterCategoryOption[];
  showCategoryFilter?: boolean;
}

const ArchiveSidebarPanel = ({
  filters,
  onChange,
  lockedFilters,
  filterDefaults,
  sortOptions = ARCHIVE_SORT_OPTIONS,
  filterCategories = [],
  showCategoryFilter = false,
}: ArchiveSidebarPanelProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const showOnSale = lockedFilters?.onSale === undefined;
  const showInStock = lockedFilters?.inStock === undefined;

  const handleReset = () => {
    const resetState: ArchiveFilterState = {
      ...DEFAULT_ARCHIVE_FILTERS,
      ...filterDefaults,
      ...lockedFilters,
    };
    const query = buildArchiveFilterSearchParams(
      resetState,
      lockedFilters,
      filterDefaults,
    );
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

      {showCategoryFilter && filterCategories.length > 0 ? (
        <ArchiveSidebarCategoryFilter
          categories={filterCategories}
          selectedIds={filters.categoryIds}
          onChange={(categoryIds) => onChange({ categoryIds })}
        />
      ) : null}

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
          options={sortOptions.map((option) => ({
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
    </div>
  );
};

export default ArchiveSidebarPanel;
