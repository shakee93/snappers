"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArchiveFilterBar from "@/components/global/primitives/archive/ArchiveFilterBar";
import {
  ArchiveFilterState,
  buildArchiveFilterSearchParams,
  parseArchiveFilters,
} from "@/lib/archiveFilters";

const ArchiveFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseArchiveFilters(searchParams),
    [searchParams],
  );

  const updateFilters = useCallback(
    (partial: Partial<ArchiveFilterState>) => {
      const next: ArchiveFilterState = { ...filters, ...partial };
      const query = buildArchiveFilterSearchParams(next);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  return <ArchiveFilterBar filters={filters} onChange={updateFilters} />;
};

export default ArchiveFilters;
