"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArchiveFilterBar from "@/components/global/primitives/archive/ArchiveFilterBar";
import ArchiveSidebarPanel from "@/components/global/primitives/archive/ArchiveSidebarPanel";
import {
  ArchiveFilterState,
  buildArchiveFilterSearchParams,
  DEALS_ARCHIVE_SORT_OPTIONS,
  DEALS_FILTER_DEFAULTS,
  DEALS_LOCKED_FILTERS,
  DEFAULT_ARCHIVE_FILTERS,
  parseArchiveFilters,
  ARCHIVE_SORT_OPTIONS,
  type ArchiveSortOption,
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
  const resolvedLockedFilters = useMemo(
    () => (dealsOnly ? DEALS_LOCKED_FILTERS : lockedFilters),
    [dealsOnly, lockedFilters],
  );
  const resolvedFilterDefaults = useMemo(
    () =>
      dealsOnly
        ? { ...DEALS_FILTER_DEFAULTS, ...filterDefaults }
        : filterDefaults,
    [dealsOnly, filterDefaults],
  );
  const resolvedBuildDefaults = useMemo(
    () => ({ ...DEFAULT_ARCHIVE_FILTERS, ...resolvedFilterDefaults }),
    [resolvedFilterDefaults],
  );
  const sortOptions: ArchiveSortOption[] = dealsOnly
    ? DEALS_ARCHIVE_SORT_OPTIONS
    : ARCHIVE_SORT_OPTIONS;

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
      const query = buildArchiveFilterSearchParams(
        next,
        resolvedLockedFilters,
        resolvedBuildDefaults,
      );
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, resolvedBuildDefaults, resolvedLockedFilters, router],
  );

  if (variant === "sidebar") {
    return (
      <ArchiveSidebarPanel
        filters={filters}
        onChange={updateFilters}
        lockedFilters={resolvedLockedFilters}
        filterDefaults={resolvedBuildDefaults}
        sortOptions={sortOptions}
      />
    );
  }

  return (
    <ArchiveFilterBar
      filters={filters}
      onChange={updateFilters}
      lockedFilters={resolvedLockedFilters}
      sortOptions={sortOptions}
    />
  );
};

export default ArchiveFilters;
