"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/store";
import { hasActiveSidebarFilters } from "@/lib/sidebarFilters";
import { VALID_DEAL_FILTER_TYPES, DealFilterType } from "@/lib/dealFilters";

interface FilterResetButtonProps {
  defaultSort?: string;
  /** When true, also clears the /deals `?filter=` param on reset. */
  resetDealsFilter?: boolean;
  ignoreInStock?: boolean;
  className?: string;
}

const FilterResetButton = ({
  defaultSort = "",
  resetDealsFilter = false,
  ignoreInStock = false,
  className = "",
}: FilterResetButtonProps) => {
  const { sidebar, resetSidebarFilters } = useStore();
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

  const hasActiveFilters =
    hasActiveSidebarFilters(sidebar, { defaultSort, ignoreInStock }) ||
    hasDealsFilter;

  if (!hasActiveFilters) {
    return null;
  }

  const handleReset = () => {
    resetSidebarFilters(defaultSort);

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
