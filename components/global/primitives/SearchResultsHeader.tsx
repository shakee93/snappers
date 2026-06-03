"use client";

import { useStore } from "@/store/store";
import FilterResetButton from "@/components/global/primitives/Filters/FilterResetButton";

interface SearchResultsHeaderProps {
  defaultSort?: string;
  resetDealsFilter?: boolean;
  ignoreInStock?: boolean;
}

const SearchResultsHeader = ({
  defaultSort = "",
  resetDealsFilter = false,
  ignoreInStock = false,
}: SearchResultsHeaderProps) => {
  const { search, isTyping } = useStore();

  if (!search) {
    return null;
  }

  return (
    <div className="mb-8 ml-6 flex items-start justify-between gap-4 mt-14">
      <h2 className="block text-sm md:text-lg font-semibold">
        Search Results for{" "}
        <span className="text-primary-500">{search}</span>
        {isTyping ? (
          <span className="text-primary-500"> Searching...</span>
        ) : null}
      </h2>
      <FilterResetButton
        resetSearchQuery
        defaultSort={defaultSort}
        resetDealsFilter={resetDealsFilter}
        ignoreInStock={ignoreInStock}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
};

export default SearchResultsHeader;
