"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { GET_BROWSE_SECTION_PRODUCTS } from "@/graphql/defs/products";
import ProductCard, {
  type ProductCardItem,
} from "@/components/home/ProductCard";
import ProductCardLoading from "@/components/global/primitives/Loading/ProductCardLoading";
import {
  BROWSE_CATEGORY_TAB_FETCH_BATCH,
  resolveBrowseCategoryScopeIds,
} from "@/lib/browseCategories";
import { getCategoryPath } from "@/lib/productUrl";
import { getCompactPageItems } from "@/lib/compactPagination";

/** Two rows × four cards on desktop. */
const PAGE_SIZE = 8;
const BROWSE_PRODUCT_GRID_CLASS_NAME =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-4";
const ALL_TAB_KEY = "all";
const CARD_ACCENT = "#3BB77E";

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

const BROWSE_PROMO_IMAGE = "/homepage/snappers-exciting-offers.jpg";

/** Left promo column - Snappers offers artwork (links to deals). */
const BrowsePromoPanel = ({ priority = false }: { priority?: boolean }) => (
  <Link
    href="/deals"
    className="relative block min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[360px] lg:h-full lg:min-h-[520px]"
  >
    <Image
      src={BROWSE_PROMO_IMAGE}
      alt="Enjoy exciting offers from Snappers - minimum order Rs. 3000. Go to deals."
      fill
      sizes="(max-width: 1024px) 100vw, 280px"
      className="object-cover object-top"
      priority={priority}
    />
  </Link>
);

/**
 * "Browse All Products" section: main-category tab filters, a feature artwork tile
 * plus a paginated product grid. Loads products in batches (100) and fetches more
 * from GraphQL as the user pages - same category scope as archive pages.
 */
const SectionBrowseProducts = ({
  className = "",
  initialAllTab,
  initialCategoryTabCaches,
  categories,
  categoryScopeById = {},
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
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const [fetchBrowseProducts] = useLazyQuery(GET_BROWSE_SECTION_PRODUCTS, {
    fetchPolicy: "no-cache",
  });

  tabCachesRef.current = tabCaches;

  const tabs = useMemo(
    () =>
      (categories ?? [])
        .filter((c): c is BrowseCategory => c != null)
        .filter(
          (c): c is BrowseCategory & { databaseId: number; name: string } =>
            !!c.databaseId && !!c.name,
        ),
    [categories],
  );

  const activeTabKey =
    activeCategoryId === null ? ALL_TAB_KEY : String(activeCategoryId);

  const activeCategory = useMemo(
    () => tabs.find((tab) => tab.databaseId === activeCategoryId) ?? null,
    [activeCategoryId, tabs],
  );

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
  const neededProductCount = page * PAGE_SIZE;

  const scrollCategoryTabs = useCallback((direction: -1 | 1) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: "smooth" });
  }, []);

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

  const tabButtonClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap px-2 py-1 text-sm font-semibold transition-colors sm:px-3 ${
      isActive
        ? "text-[#253D4E]"
        : "text-neutral-500 hover:text-neutral-800"
    }`;

  const activeTabStyle = (isActive: boolean): CSSProperties | undefined =>
    isActive ? { color: CARD_ACCENT } : undefined;

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-5">
        <div className="hidden lg:block lg:w-[min(100%,280px)] lg:shrink-0">
          <BrowsePromoPanel priority={activeCategoryId === null} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 border-b border-neutral-200 pb-3 sm:gap-2">
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => scrollCategoryTabs(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => scrollCategoryTabs(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div
              ref={tabsScrollRef}
              className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                onClick={() => handleTabClick(null)}
                aria-pressed={activeCategoryId === null}
                className={tabButtonClass(activeCategoryId === null)}
                style={activeTabStyle(activeCategoryId === null)}
              >
                All
              </button>
              {tabs.map((category) => {
                const isActive = activeCategoryId === category.databaseId;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleTabClick(category.databaseId)}
                    aria-pressed={isActive}
                    className={tabButtonClass(isActive)}
                    style={activeTabStyle(isActive)}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mt-4 ${BROWSE_PRODUCT_GRID_CLASS_NAME}`}>
            {isLoadingTab ? (
              Array.from({ length: PAGE_SIZE }, (_, index) =>
                productSkeleton(`grid-${index}`),
              )
            ) : visibleProducts.length ? (
              visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-2 py-12 text-center text-sm font-medium text-neutral-500 lg:col-span-4">
                No products found in this category.
              </p>
            )}

            {loadingMore &&
              Array.from({ length: Math.min(PAGE_SIZE, 2) }, (_, index) =>
                productSkeleton(`loading-more-${index}`),
              )}
          </div>
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
