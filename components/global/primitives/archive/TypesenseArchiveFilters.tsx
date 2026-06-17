"use client";

import { useMemo } from "react";
import ArchiveFilterBar from "@/components/global/primitives/archive/ArchiveFilterBar";
import { useStore } from "@/store/store";
import {
  ArchiveFilterState,
  archiveSortToTypesense,
  typesenseSortToArchive,
} from "@/lib/archiveFilters";

const TypesenseArchiveFilters = () => {
  const {
    sidebar,
    syncOnSale,
    setInStock,
    synPriceRange,
    setSort,
  } = useStore();

  const filters = useMemo<ArchiveFilterState>(
    () => ({
      onSale: sidebar.on_sale,
      inStock: sidebar.in_stock,
      minPrice: sidebar.priceRange[0],
      maxPrice: sidebar.priceRange[1],
      sort: typesenseSortToArchive(sidebar.sort),
    }),
    [
      sidebar.in_stock,
      sidebar.on_sale,
      sidebar.priceRange,
      sidebar.sort,
    ],
  );

  const updateFilters = (partial: Partial<ArchiveFilterState>) => {
    if (partial.onSale !== undefined) {
      syncOnSale(partial.onSale);
    }

    if (partial.inStock !== undefined) {
      setInStock(partial.inStock);
    }

    if (partial.minPrice !== undefined || partial.maxPrice !== undefined) {
      synPriceRange([
        partial.minPrice ?? filters.minPrice,
        partial.maxPrice ?? filters.maxPrice,
      ]);
    }

    if (partial.sort !== undefined) {
      setSort(archiveSortToTypesense(partial.sort));
    }
  };

  return <ArchiveFilterBar filters={filters} onChange={updateFilters} />;
};

export default TypesenseArchiveFilters;
