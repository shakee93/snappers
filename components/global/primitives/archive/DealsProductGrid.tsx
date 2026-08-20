"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard, {
  type ProductCardProps,
} from "@/components/home/ProductCard";
import { ARCHIVE_PRODUCT_GRID_CLASS_NAME } from "@/components/global/primitives/Loading/ProductCardLoading";
import {
  DEALS_FILTER_DEFAULTS,
  DEALS_LOCKED_FILTERS,
  parseArchiveFilters,
} from "@/lib/archiveFilters";
import { filterDealProducts, type DealProduct } from "@/lib/dealProducts";

export interface DealsProductGridProps {
  products: DealProduct[];
  productCardProps?: Pick<ProductCardProps, "badgeLabel" | "accentColor">;
}

/** Deal-only grid — filters/sorts SSR deal products client-side. */
const DealsProductGrid = ({
  products,
  productCardProps,
}: DealsProductGridProps) => {
  const searchParams = useSearchParams();

  const filters = useMemo(
    () =>
      parseArchiveFilters(
        searchParams,
        DEALS_FILTER_DEFAULTS,
        DEALS_LOCKED_FILTERS,
      ),
    [searchParams],
  );

  const visibleProducts = useMemo(
    () => filterDealProducts(products, filters),
    [filters, products],
  );

  if (!visibleProducts.length) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        {products.length
          ? "No active deals match your filters right now."
          : "No active deals right now — check back soon."}
      </p>
    );
  }

  return (
    <div className={ARCHIVE_PRODUCT_GRID_CLASS_NAME}>
      {visibleProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          {...productCardProps}
        />
      ))}
    </div>
  );
};

export default DealsProductGrid;
