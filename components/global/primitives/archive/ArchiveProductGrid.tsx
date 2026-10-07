"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/home/ProductCard";
import {
  ARCHIVE_PRODUCT_GRID_CLASS_NAME,
  ProductCardsSkeleton,
} from "@/components/global/primitives/Loading/ProductCardLoading";
import {
  buildArchiveFilterSearchParams,
  parseArchiveFilters,
  resolveArchiveCategoryIdIn,
  toArchiveProductsVariables,
} from "@/lib/archiveFilters";
import { getCompactPageItems } from "@/lib/compactPagination";
import {
  fetchArchiveProductsClient,
  type ArchiveProductNode,
} from "@/lib/fetchArchiveProductsClient";
import { getProductListKey } from "@/lib/productListKey";

export interface ArchiveProductGridProps {
  /** Fixed scope on category archive routes. */
  categoryIds?: number[];
  /** Root category id → GraphQL scope (parent + children). */
  categoryScopeById?: Record<number, number[]>;
  first?: number;
}

type ProductCache = {
  products: ArchiveProductNode[];
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
  categoryScopeById,
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

  const resolvedCategoryIds = useMemo(
    () =>
      resolveArchiveCategoryIdIn(
        filters.categoryIds,
        categoryIds,
        categoryScopeById,
      ),
    [categoryIds, categoryScopeById, filters.categoryIds],
  );

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        filters,
        categoryIds,
        resolvedCategoryIds,
        first,
      }),
    [filters, categoryIds, first, resolvedCategoryIds],
  );

  const [cache, setCache] = useState<ProductCache>(EMPTY_CACHE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingMoreRef = useRef(false);

  const loadBatch = useCallback(
    async (after?: string | null): Promise<ProductCache> => {
      const batch = await fetchArchiveProductsClient({
        ...toArchiveProductsVariables(filters, resolvedCategoryIds, first),
        after: after ?? undefined,
      });

      return {
        products: batch.products,
        hasNextPage: batch.hasNextPage,
        endCursor: batch.endCursor,
        loaded: true,
      };
    },
    [filters, first, resolvedCategoryIds],
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
        <ProductCardsSkeleton className={ARCHIVE_PRODUCT_GRID_CLASS_NAME} />
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
          className={`${ARCHIVE_PRODUCT_GRID_CLASS_NAME} ${
            loadingMore ? "opacity-60" : ""
          }`}
        >
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={getProductListKey(product, index)}
              product={product}
            />
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

          {getCompactPageItems(page, Math.max(pageCount, page)).map(
            (item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-9 w-9 items-center justify-center text-sm font-semibold text-header-green/40"
                    aria-hidden
                  >
                    …
                  </span>
                );
              }

              const isActive = item === page;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-label={`Go to page ${item}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-header-action text-header-green"
                      : "border border-[#E8E8E8] bg-white text-header-green hover:border-header-green/40 hover:bg-header-cream/30"
                  }`}
                >
                  {item}
                </button>
              );
            },
          )}

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
