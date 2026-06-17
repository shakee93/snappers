"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import ProductCard from "@/components/home/ProductCard";
import { GET_ARCHIVE_PRODUCTS } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import {
  parseArchiveFilters,
  toArchiveProductsVariables,
} from "@/lib/archiveFilters";

export interface ArchiveProductGridProps {
  categoryIds?: number[];
  first?: number;
}

type ArchiveProduct = SimpleProduct & VariableProduct;

const ArchiveProductGrid = ({
  categoryIds,
  first = 45,
}: ArchiveProductGridProps) => {
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseArchiveFilters(searchParams),
    [searchParams],
  );

  const variables = useMemo(
    () => toArchiveProductsVariables(filters, categoryIds, first),
    [filters, categoryIds, first],
  );

  const { data, loading, error } = useQuery(GET_ARCHIVE_PRODUCTS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const products = (data?.products?.nodes ?? []) as ArchiveProduct[];

  return (
    <>

      {loading && !products.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="py-12 text-center text-sm text-red-600">
          Could not load products. Please try again.
        </p>
      ) : null}

      {!loading && !error && !products.length ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          No products found matching your filters.
        </p>
      ) : null}

      {products.length > 0 ? (
        <div
          className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 ${
            loading ? "opacity-60" : ""
          }`}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ArchiveProductGrid;
