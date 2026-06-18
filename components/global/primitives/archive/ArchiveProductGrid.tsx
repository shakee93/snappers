"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLazyQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/home/ProductCard";
import { GET_ARCHIVE_PRODUCTS } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import {
  buildArchiveFilterSearchParams,
  parseArchiveFilters,
  toArchiveProductsVariables,
} from "@/lib/archiveFilters";

export interface ArchiveProductGridProps {
  categoryIds?: number[];
  first?: number;
}

type ArchiveProduct = SimpleProduct & VariableProduct;

type ProductCache = {
  products: ArchiveProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
  loaded: boolean;
};

const EMPTY_CACHE: ProductCache = {
  products: [],
  hasNextPage: false,
  endCursor: null,
  loaded: false,
};

const ArchiveProductGrid = ({
  categoryIds,
  first = 45,
}: ArchiveProductGridProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseArchiveFilters(searchParams),
    [searchParams],
  );

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );

  const filterKey = useMemo(
    () => JSON.stringify({ filters, categoryIds, first }),
    [filters, categoryIds, first],
  );

  const [cache, setCache] = useState<ProductCache>(EMPTY_CACHE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingMoreRef = useRef(false);

  const [fetchArchiveProducts] = useLazyQuery(GET_ARCHIVE_PRODUCTS, {
    notifyOnNetworkStatusChange: true,
  });

  const loadBatch = useCallback(
    async (after?: string | null): Promise<ProductCache> => {
      const { data, error: queryError } = await fetchArchiveProducts({
        variables: {
          ...toArchiveProductsVariables(filters, categoryIds, first),
          after: after ?? undefined,
        },
      });

      if (queryError) {
        throw queryError;
      }

      const nodes = (data?.products?.nodes ?? []) as ArchiveProduct[];
      const pageInfo = data?.products?.pageInfo;

      return {
        products: nodes,
        hasNextPage: pageInfo?.hasNextPage ?? false,
        endCursor: pageInfo?.endCursor ?? null,
        loaded: true,
      };
    },
    [categoryIds, fetchArchiveProducts, filters, first],
  );

  useEffect(() => {
    let cancelled = false;
    setCache(EMPTY_CACHE);
    setError(null);
    setInitialLoading(true);

    void loadBatch()
      .then((next) => {
        if (!cancelled) setCache(next);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterKey, loadBatch]);

  const pageCount = Math.max(1, Math.ceil(cache.products.length / first));
  const visibleProducts = useMemo(
    () => cache.products.slice((page - 1) * first, page * first),
    [cache.products, first, page],
  );
  const neededProductCount = page * first;

  useEffect(() => {
    if (!cache.loaded) return;
    if (cache.products.length >= neededProductCount || !cache.hasNextPage) return;
    if (loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    void loadBatch(cache.endCursor)
      .then((nextBatch) => {
        setCache((prev) => ({
          products: [...prev.products, ...nextBatch.products],
          hasNextPage: nextBatch.hasNextPage,
          endCursor: nextBatch.endCursor,
          loaded: true,
        }));
      })
      .catch((err: Error) => {
        setError(err);
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [cache, loadBatch, neededProductCount]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(buildArchiveFilterSearchParams(filters));
      if (nextPage > 1) {
        params.set("page", String(nextPage));
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, pathname, router],
  );

  useEffect(() => {
    if (!cache.loaded || loadingMore) return;
    if (page <= pageCount) return;
    if (cache.hasNextPage) return;
    if (page > 1) goToPage(pageCount);
  }, [cache.hasNextPage, cache.loaded, goToPage, loadingMore, page, pageCount]);

  const showSkeleton = initialLoading && visibleProducts.length === 0;
  const showPagination =
    cache.loaded && (pageCount > 1 || cache.hasNextPage) && !error;

  return (
    <>
      {showSkeleton ? (
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

      {!initialLoading && !error && !visibleProducts.length ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          No products found matching your filters.
        </p>
      ) : null}

      {visibleProducts.length > 0 ? (
        <div
          className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 ${
            loadingMore ? "opacity-60" : ""
          }`}
        >
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      {showPagination ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          {page > 1 ? (
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-header-green transition-colors hover:border-header-green/40 hover:bg-header-cream/30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}

          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            const isActive = pageNumber === page;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToPage(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-header-action text-header-green"
                    : "border border-[#E8E8E8] bg-white text-header-green hover:border-header-green/40 hover:bg-header-cream/30"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          {page < pageCount || cache.hasNextPage ? (
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={loadingMore}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-[#E8E8E8] bg-white px-3 text-sm font-semibold text-header-green transition-colors hover:border-header-green/40 hover:bg-header-cream/30 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default ArchiveProductGrid;
