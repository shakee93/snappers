"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArchiveFilterBar from "@/components/global/primitives/archive/ArchiveFilterBar";
import ArchiveSidebarPanel from "@/components/global/primitives/archive/ArchiveSidebarPanel";
import {
  ArchiveFilterState,
  buildArchiveFilterSearchParams,
  DEALS_FILTER_DEFAULTS,
  DEALS_LOCKED_FILTERS,
  parseArchiveFilters,
} from "@/lib/archiveFilters";

interface ArchiveFiltersProps {
  filterDefaults?: Partial<ArchiveFilterState>;
  lockedFilters?: Partial<ArchiveFilterState>;
  dealsOnly?: boolean;
  variant?: "bar" | "sidebar";
}

const ArchiveFilters = ({
  filterDefaults,
  lockedFilters,
  dealsOnly = false,
  variant = "bar",
}: ArchiveFiltersProps) => {
  const resolvedLockedFilters = dealsOnly
    ? DEALS_LOCKED_FILTERS
    : lockedFilters;
  const resolvedFilterDefaults = dealsOnly
    ? { ...DEALS_FILTER_DEFAULTS, ...filterDefaults }
    : filterDefaults;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () =>
      parseArchiveFilters(
        searchParams,
        resolvedFilterDefaults,
        resolvedLockedFilters,
      ),
    [resolvedFilterDefaults, resolvedLockedFilters, searchParams],
  );

  const updateFilters = useCallback(
    (partial: Partial<ArchiveFilterState>) => {
      const next: ArchiveFilterState = {
        ...filters,
        ...partial,
        ...resolvedLockedFilters,
      };
      const query = buildArchiveFilterSearchParams(next, resolvedLockedFilters);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, resolvedLockedFilters, router],
  );

  if (variant === "sidebar") {
    return (
      <ArchiveSidebarPanel
        filters={filters}
        onChange={updateFilters}
        lockedFilters={resolvedLockedFilters}
      />
    );
  }

  return (
    <ArchiveFilterBar
      filters={filters}
      onChange={updateFilters}
      lockedFilters={resolvedLockedFilters}
    />
  );
};

export default ArchiveFilters;
