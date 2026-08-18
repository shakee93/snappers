"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client";
import { ArrowRight } from "lucide-react";
import { GET_BROWSE_SECTION_PRODUCTS } from "@/graphql/defs/products";
import ProductCard, {
  type ProductCardItem,
} from "@/components/home/ProductCard";
import ProductCardLoading from "@/components/global/primitives/Loading/ProductCardLoading";
import {
  BROWSE_ALL_TAB_FEATURE_IMAGE,
  BROWSE_CATEGORY_TAB_FETCH_BATCH,
  filterBrowseCategoryTabs,
  getBrowseFeatureImageForTabIndex,
  resolveBrowseCategoryScopeIds,
} from "@/lib/browseCategories";
import { getCategoryPath } from "@/lib/productUrl";
import { getCompactPageItems } from "@/lib/compactPagination";

const PAGE_SIZE = 6;
const ALL_TAB_KEY = "all";

type TabProductCache = {
  products: ProductCardItem[];
  hasNextPage: boolean;
  endCursor: string | null;
  loaded: boolean;
};

export type BrowseInitialCache = {
  products: ProductCardItem[];
  hasNextPage: boolean;
  endCursor: string | null;
};

interface BrowseCategory {
  id: string;
  databaseId?: number | null;
  name?: string | null;
  slug?: string | null;
  parentDatabaseId?: number | null;
  image?: { sourceUrl?: string | null } | null;
}

export interface SectionBrowseProductsProps {
  className?: string;
  /** Initial "All" tab cache from SSR (first batch + pagination cursor). */
  initialAllTab?: BrowseInitialCache;
  /** SSR-hydrated product cache keyed by category `databaseId`. */
  initialCategoryTabCaches?: Record<number, BrowseInitialCache>;
  /** Top-level categories rendered as filter tabs. */
  categories?: (BrowseCategory | null)[] | null;
  /** Parent category ID → IDs to query (parent + all subcategories). */
  categoryScopeById?: Record<number, number[]>;
  /** Default banner for the "All" tab when no category is selected. */
  defaultFeatureImage?: string;
}

const buildInitialTabCaches = (
  initialAllTab?: BrowseInitialCache,
  initialCategoryTabCaches?: Record<number, BrowseInitialCache>,
): Record<string, TabProductCache> => {
  const caches: Record<string, TabProductCache> = {
    [ALL_TAB_KEY]: {
      products: initialAllTab?.products ?? [],
      hasNextPage: initialAllTab?.hasNextPage ?? false,
      endCursor: initialAllTab?.endCursor ?? null,
      loaded: !!initialAllTab,
    },
  };

  if (initialCategoryTabCaches) {
    for (const [categoryId, cache] of Object.entries(
      initialCategoryTabCaches,
    )) {
      caches[categoryId] = { ...cache, loaded: true };
    }
  }

  return caches;
};

const productSkeleton = (key: string) => <ProductCardLoading key={key} />;

interface BrowseFeatureBannerProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

/** Category feature tile — `object-cover` fills the bounded container. */
const BrowseFeatureBanner = ({
  src,
  alt,
  className = "",
  priority = false,
}: BrowseFeatureBannerProps) => (
  <div className={`relative overflow-hidden rounded-xl ${className}`}>
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 50vw"
      className="object-cover object-center"
      priority={priority}
    />
  </div>
);

/**
 * "Browse All Products" section: main-category tab filters, a feature artwork tile
 * plus a paginated product grid. Loads products in batches (100) and fetches more
 * from GraphQL as the user pages — same category scope as archive pages.
 */
const SectionBrowseProducts = ({
  className = "",
  initialAllTab,
  initialCategoryTabCaches,
  categories,
  categoryScopeById = {},
  defaultFeatureImage = BROWSE_ALL_TAB_FEATURE_IMAGE,
}: SectionBrowseProductsProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [tabCaches, setTabCaches] = useState<Record<string, TabProductCache>>(
    () => buildInitialTabCaches(initialAllTab, initialCategoryTabCaches),
  );
  const [loadingTab, setLoadingTab] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const prefetchPromisesRef = useRef(new Map<string, Promise<void>>());
  const tabCachesRef = useRef<Record<string, TabProductCache>>({});

  const [fetchBrowseProducts] = useLazyQuery(GET_BROWSE_SECTION_PRODUCTS, {
    fetchPolicy: "no-cache",
  });

  tabCachesRef.current = tabCaches;

  const tabs = useMemo(
    () =>
      filterBrowseCategoryTabs(
        (categories ?? []).filter((c): c is BrowseCategory => c != null),
      )
        .filter(
          (c): c is BrowseCategory & { databaseId: number } =>
            !!c.databaseId && !!c.name,
        )
        .map((category, index) => ({
          ...category,
          featureImage: getBrowseFeatureImageForTabIndex(index),
        })),
    [categories],
  );

  const activeTabKey =
    activeCategoryId === null ? ALL_TAB_KEY : String(activeCategoryId);

  const activeCategory = useMemo(
    () => tabs.find((tab) => tab.databaseId === activeCategoryId) ?? null,
    [activeCategoryId, tabs],
  );

  const activeFeatureImage = useMemo(() => {
    if (activeCategoryId === null) return defaultFeatureImage;
    return activeCategory?.featureImage ?? defaultFeatureImage;
  }, [activeCategory?.featureImage, activeCategoryId, defaultFeatureImage]);

  const activeFeatureAlt = useMemo(() => {
    if (activeCategory?.name) return `Featured ${activeCategory.name} products`;
    return "Featured pet products";
  }, [activeCategory?.name]);

  const loadProducts = useCallback(
    async (
      categoryId: number | null,
      after?: string | null,
    ): Promise<TabProductCache> => {
      const tabCategory = tabs.find((tab) => tab.databaseId === categoryId);
      const scopedIds =
        categoryId === null
          ? null
          : categoryScopeById[categoryId] ??
            (tabCategory ? resolveBrowseCategoryScopeIds(tabCategory) : [categoryId]);

      const categoryScopeIds =
        categoryId === null
          ? null
          : scopedIds?.length
            ? scopedIds
            : [categoryId];

      const { data } = await fetchBrowseProducts({
        variables: {
          categoryIdIn: categoryScopeIds,
          first: BROWSE_CATEGORY_TAB_FETCH_BATCH,
          after: after ?? undefined,
        },
      });

      const nodes = (data?.products?.nodes ?? []) as ProductCardItem[];
      const pageInfo = data?.products?.pageInfo;

      return {
        products: nodes,
        hasNextPage: pageInfo?.hasNextPage ?? false,
        endCursor: pageInfo?.endCursor ?? null,
        loaded: true,
      };
    },
    [categoryScopeById, fetchBrowseProducts, tabs],
  );

  const ensureTabCache = useCallback(
    async (categoryId: number | null): Promise<void> => {
      const key = categoryId === null ? ALL_TAB_KEY : String(categoryId);
      if (tabCachesRef.current[key]?.loaded) return;

      const existing = prefetchPromisesRef.current.get(key);
      if (existing) {
        await existing;
        return;
      }

      const promise = loadProducts(categoryId)
        .then((cache) => {
          setTabCaches((prev) => {
            if (prev[key]?.loaded) return prev;
            return { ...prev, [key]: cache };
          });
        })
        .finally(() => {
          prefetchPromisesRef.current.delete(key);
        });

      prefetchPromisesRef.current.set(key, promise);
      await promise;
    },
    [loadProducts],
  );

  const handleTabClick = useCallback(
    async (categoryId: number | null) => {
      setActiveCategoryId(categoryId);
      setPage(1);

      const key = categoryId === null ? ALL_TAB_KEY : String(categoryId);
      if (tabCachesRef.current[key]?.loaded) return;

      setLoadingTab(true);
      try {
        await ensureTabCache(categoryId);
      } finally {
        setLoadingTab(false);
      }
    },
    [ensureTabCache],
  );

  const activeCache = tabCaches[activeTabKey] ?? {
    products: [],
    hasNextPage: false,
    endCursor: null,
    loaded: false,
  };
  const activeProducts = activeCache.products;

  const pageCount = Math.max(1, Math.ceil(activeProducts.length / PAGE_SIZE));
  const visibleProducts = useMemo(
    () => activeProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [activeProducts, page],
  );
  const rowOneProducts = visibleProducts.slice(0, 2);
  const rowTwoProducts = visibleProducts.slice(2, PAGE_SIZE);

  const neededProductCount = page * PAGE_SIZE;

  useEffect(() => {
    const cache = tabCaches[activeTabKey];
    if (!cache) return;
    if (cache.products.length >= neededProductCount || !cache.hasNextPage) return;
    if (loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    void loadProducts(activeCategoryId, cache.endCursor)
      .then((nextBatch) => {
        setTabCaches((prev) => {
          const current = prev[activeTabKey] ?? {
            products: [],
            hasNextPage: false,
            endCursor: null,
            loaded: true,
          };
          return {
            ...prev,
            [activeTabKey]: {
              products: [...current.products, ...nextBatch.products],
              hasNextPage: nextBatch.hasNextPage,
              endCursor: nextBatch.endCursor,
              loaded: true,
            },
          };
        });
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [
    activeCategoryId,
    activeTabKey,
    activeProducts.length,
    loadProducts,
    neededProductCount,
  ]);

  const isLoadingTab =
    loadingTab &&
    activeCategoryId !== null &&
    !tabCaches[activeTabKey]?.loaded;

  const initialProducts = initialAllTab?.products ?? [];
  if (!initialProducts.length) return null;

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-[#092412] sm:text-base">
          Browse
        </p>
        <h2 className="mt-2 font-albra text-3xl font-bold leading-tight text-[#092412] sm:mt-3 sm:text-4xl md:mt-5 md:text-6xl">
          Browse{" "}
          <span className="text-[#769F5F]">All Products</span>
        </h2>
      </div>

      <div className="-mx-3 mt-6 overflow-x-auto px-3 sm:mt-8 md:mx-0 md:mt-10 md:overflow-visible md:px-0">
        <div className="flex w-max min-w-full flex-nowrap items-center justify-start gap-1.5 md:w-auto md:flex-wrap md:justify-center">
          <button
            type="button"
            onClick={() => handleTabClick(null)}
            aria-pressed={activeCategoryId === null}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
              activeCategoryId === null
                ? "bg-[#092412] text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            All
          </button>
          {tabs.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleTabClick(category.databaseId)}
              aria-pressed={activeCategoryId === category.databaseId}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
                activeCategoryId === category.databaseId
                  ? "bg-[#092412] text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4 lg:gap-6">
        <BrowseFeatureBanner
          src={activeFeatureImage}
          alt={activeFeatureAlt}
          priority={activeCategoryId === null}
          className="aspect-[16/10] sm:aspect-[5/3] lg:hidden"
        />

        <div className="hidden lg:grid lg:grid-cols-4 lg:items-start lg:gap-6">
          <BrowseFeatureBanner
            src={activeFeatureImage}
            alt={activeFeatureAlt}
            priority={activeCategoryId === null}
            className="col-span-2 h-full"
          />
          {isLoadingTab
            ? [0, 1].map((index) => productSkeleton(`row1-${index}`))
            : rowOneProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          {!isLoadingTab && !rowOneProducts.length && (
            // Floor only on the empty state so Cat/Dog still size from cards;
            // the banner's h-full fills the row this paragraph defines.
            <p className="col-span-2 flex min-h-[clamp(280px,32vw,440px)] items-center justify-center py-8 text-sm font-medium text-neutral-500">
              No products found in this category.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {isLoadingTab ? (
            Array.from({ length: PAGE_SIZE }, (_, index) => (
              <div key={index} className={index < 2 ? "lg:hidden" : undefined}>
                {productSkeleton(`grid-${index}`)}
              </div>
            ))
          ) : (
            <>
              <div className="contents lg:hidden">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {!visibleProducts.length && (
                  <p className="col-span-2 py-8 text-center text-sm font-medium text-neutral-500">
                    No products found in this category.
                  </p>
                )}
              </div>
              <div className="hidden lg:contents">
                {rowTwoProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

          {loadingMore &&
            Array.from({ length: Math.min(PAGE_SIZE, 2) }, (_, index) => (
              <div
                key={`loading-more-${index}`}
                className={
                  visibleProducts.length + index < 2 ? "lg:hidden" : undefined
                }
              >
                {productSkeleton(`loading-more-${index}`)}
              </div>
            ))}
        </div>
      </div>

      {(pageCount > 1 || activeCache.hasNextPage) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:mt-8 md:mt-10">
          {getCompactPageItems(page, Math.max(pageCount, page)).map(
            (item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-8 w-8 items-center justify-center text-xs font-bold text-neutral-400 sm:h-9 sm:w-9 sm:text-sm"
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
                  onClick={() => setPage(item)}
                  aria-label={`Go to page ${item}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors sm:h-9 sm:w-9 sm:text-sm ${
                    isActive
                      ? "bg-[#092412] text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {item}
                </button>
              );
            },
          )}

          {(page < pageCount || activeCache.hasNextPage) && (
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loadingMore}
              className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 sm:ml-2 sm:gap-2 sm:px-3 sm:text-sm"
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Next page</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      )}

      {activeCategory?.slug && (
        <div className="mt-6 flex justify-center sm:mt-8">
          <Link
            href={getCategoryPath(activeCategory.slug)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-[#092412] underline-offset-4 transition-colors hover:underline"
          >
            View all {activeCategory.name} products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default SectionBrowseProducts;
