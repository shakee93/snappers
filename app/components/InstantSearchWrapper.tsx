"use client";
import { Configure, InstantSearch, RefinementList } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import ProductGridInstant from "@/app/components/ProductGridInstant";
import SearchInput from "@/app/components/SearchInput";
import TabFilters from "@/app/components/TabFilters";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { PRICE_RANGE } from "@/app/components/Filters/PriceFilter";
import SortInput from "@/app/components/SortInput";
import { useDebounce } from "use-debounce";
import MobileFilterSheet from "@/app/components/MobileFilterSheet";
import { UiState } from "instantsearch.js";
import { useSearchParams, useRouter } from "next/navigation";
import { HIDDEN_PRODUCT_SLUGS } from "@/lib/hidden-products";
import { DealFilterType, DealTagSlug, DEAL_FILTER_TO_TAG, VALID_DEAL_FILTER_TYPES } from "@/lib/dealFilters";

type CustomUiState = UiState & {
  product: {
    query: string;
    categories: number[];
    brands: number[];
    priceRange: number[];
    on_sale: boolean;
    in_stock: boolean;
    sort: string;
    variations: Record<string, string[]>;
    page?: number;
  };
};

const arrEq = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const variationsEq = (a: Record<string, string[]>, b: Record<string, string[]>) => {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  return ak.every((k, i) => {
    if (k !== bk[i]) return false;
    const av = a[k];
    const bv = b[k];
    return av.length === bv.length && av.every((v, j) => v === bv[j]);
  });
};

const DelayedRender: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible ? <>{children}</> : null;
};

interface InstantSearchWrapperProps {
  search?: boolean;
  filters?: boolean;
  categories?: ProductCategory[];
  brands?: Brand[];
  brand?: Brand;
  category?: ProductCategory;
  routing?: boolean;
  bindToStore?: boolean;
  server?: boolean;
  sort?: boolean;
  tag?: string;
  searchQueryValue?: string;
  dealsType?: DealFilterType[];
  dealTags?: string[];
}

const typesenseConfig = {
  host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || "api.gqmobiles.lk",
  port: (process.env.NEXT_PUBLIC_TYPESENSE_PORT as unknown as number) || 80,
  path: process.env.NEXT_PUBLIC_TYPESENSE_PATH || "",
  protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
};


const typesenseInstantSearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "xyz",
    nodes: [typesenseConfig],
    cacheSearchResultsForSeconds: 2 * 60,
    retryIntervalSeconds: 500,
    numRetries: 3000,
    connectionTimeoutSeconds: 10,
  },
  additionalSearchParameters: {
    query_by: "name, description, productTags",
    query_by_weights: "3,1,1",
    exclude_fields: "description, shortDescription, galleryImages, attributes",
    facet_by: "brands_facet, categories_facet, variation_facets.*",
    max_facet_values: 20,
    // use_cache: false,
    // filter_by: filterQuery,
    sort_by: "in_stock:desc",
    prefix: true,
    num_typos: 1,
  },
});

const InstantSearchWrapper = ({
  bindToStore = false,
  search = false,
  filters = true,
  routing = false,
  categories,
  server = true,
  brands,
  brand,
  category,
  sort,
  tag,
  searchQueryValue,
  dealsType,
  dealTags,
}: InstantSearchWrapperProps) => {
  const { sidebar, setSearchMounted, isTyping } = useStore();
  const [differedSidebar] = useDebounce(sidebar, 800);
  const [hitsPerPage, setHitsPerPage] = useState<number>(12);
  // useSearchParams here triggers BAILOUT_TO_CLIENT_SIDE_RENDERING for the
  // InstantSearch subtree on routes that wrap ArchiveLayout in <Suspense>.
  // That bailout is what makes the response cacheable at the edge — without
  // it, InstantSearchNext runs SSR and its internal headers() call marks
  // the response private/no-store. Don't replace this hook with a state +
  // effect bridge: that breaks ISR caching for /new-arrivals and the
  // ArchiveLayout-using routes (verified via prod cache headers post-merge).
  const searchParams = useSearchParams();
  const router = useRouter();
  const [debouncedIsTyping] = useDebounce(isTyping, 500);

  useEffect(() => {
    setSearchMounted();
  }, []);

  // Effective filter values: when the URL has a filter param we honor it
  // directly. This way the SSR-rendered filter already matches a shared
  // /collections/X?in_stock=true link — the server-issued search returns
  // the right hits and the client doesn't have to re-search after the
  // queueMicrotask sync below catches the store up to the URL.
  const effective = useMemo(() => {
    const brandsParam = searchParams.get('brands');
    const categoriesParam = searchParams.get('categories');
    const priceRangeParam = searchParams.get('priceRange');

    let urlPriceRange: number[] | null = null;
    if (priceRangeParam) {
      const range = priceRangeParam.split(',').filter(Boolean).map(Number);
      if (range.length === 2) urlPriceRange = range;
    }

    const urlVariations: Record<string, string[]> = {};
    let hasUrlVariations = false;
    searchParams.forEach((value, key) => {
      if (key.startsWith('variation_') && value) {
        urlVariations[key.replace('variation_', '')] = value.split(',').filter(Boolean);
        hasUrlVariations = true;
      }
    });

    return {
      brands: brandsParam ? brandsParam.split(',').filter(Boolean).map(Number) : sidebar.brands,
      categories: categoriesParam ? categoriesParam.split(',').filter(Boolean).map(Number) : sidebar.categories,
      priceRange: urlPriceRange ?? sidebar.priceRange,
      on_sale: searchParams.has('on_sale') ? searchParams.get('on_sale') === 'true' : sidebar.on_sale,
      in_stock: searchParams.has('in_stock') ? searchParams.get('in_stock') === 'true' : sidebar.in_stock,
      variations: hasUrlVariations ? urlVariations : sidebar.variations,
    };
  }, [searchParams, sidebar]);

  // /deals reads its tab selection from `?filter=clearance,offers` so
  // we keep the deals page itself static (no SSR searchParams read) and
  // let the bridge feed the override here. `clearance` and `offers` are
  // mapped to the same WP tag slugs the page uses for the SSR default.
  // Gated on `dealTags` so the override only applies on routes that
  // already opt-in (i.e. /deals); without this guard, /samsung?filter=clearance
  // would silently filter brand pages by the clearance tag.
  const effectiveDealTags = useMemo(() => {
    if (!dealTags) return dealTags;
    const filterParam = searchParams.get('filter');
    if (!filterParam) return dealTags;
    const slugs = filterParam
      .split(',')
      .map((v) => v.trim())
      .filter((v): v is DealFilterType =>
        VALID_DEAL_FILTER_TYPES.includes(v as DealFilterType),
      )
      .map((v): DealTagSlug => DEAL_FILTER_TO_TAG[v]);
    return slugs.length > 0 ? slugs : dealTags;
  }, [searchParams, dealTags]);

  const getFilterQuery: () => string = () => {
    const f = [
      HIDDEN_PRODUCT_SLUGS.size > 0
        ? Array.from(HIDDEN_PRODUCT_SLUGS).map(s => `slug:!=${s}`).join(" && ")
        : null,
      effective.priceRange.join("") !== PRICE_RANGE.join("")
        ? `rawPrice:[${effective.priceRange[0]}..${effective.priceRange[1]}]`
        : null,
      category
        ? `productCategories.edges.node.databaseId:${category.databaseId}`
        : effective.categories.length > 0
          ? `productCategories.edges.node.databaseId:[${effective.categories.join(
            ","
          )}]`
          : null,
      brand
        ? `brands.nodes.databaseId:${brand.databaseId}`
        : effective.brands.length > 0
          ? `brands.nodes.databaseId:[${effective.brands.join(",")}]`
          : null,
      effective.on_sale ? "onSale:true" : null,
      effective.in_stock ? "stockStatus:IN_STOCK && productTags.nodes.slug:!=pre-order" : null,
      sidebar.out_of_stock ? "stockStatus:OUT_OF_STOCK" : null,
      effectiveDealTags && effectiveDealTags.length > 0
        ? `productTags.nodes.slug:[${effectiveDealTags.join(",")}]`
        : tag
          ? `productTags.nodes.slug:${tag}`
          : null,
    ];

    // Add variation filters
    Object.entries(effective.variations).forEach(([attribute, values]) => {
      if (values.length > 0) {
        f.push(`variation_facets.${attribute}:[${values.join(",")}]`);
      }
    });


    return f.filter((n) => n).join(" && ");
  };

  const [filterQuery, setFilterQuery] = useState<string>(getFilterQuery);

  useEffect(() => {
    setFilterQuery(getFilterQuery);
    // setSortQuery(differedSidebar.sort);
  }, [differedSidebar, tag, JSON.stringify(effectiveDealTags || [])]);

  useEffect(() => {
    if (!search) {
      setFilterQuery(getFilterQuery);
    }
    // setSortQuery(differedSidebar.sort);
  }, [search]);

  // Map UiState → URL. Reads the live Zustand store (where filter changes
  // land); when the store is still at default, falls back to parsing the
  // current window.location.search directly. We can't trust uiState as the
  // fallback because react-instantsearch normalises UiState through widget
  // connectors and drops custom keys (categories, brands, …) that no
  // widget reads — without the URL fallback, the initial-mount race where
  // stateToRoute fires before our queueMicrotask sync would write an
  // empty params object and strip a shared-link URL like ?brands=1625.
  const stateToRoute = useCallback((uiState: CustomUiState) => {
    const _sidebar = useStore.getState().sidebar;
    const urlParams = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
    const fromUrl = (key: string): string | null => urlParams?.get(key) ?? null;
    const parseNumList = (s: string | null) =>
      s ? s.split(',').filter(Boolean).map(Number) : [];

    const brands = _sidebar.brands.length > 0
      ? _sidebar.brands
      : parseNumList(fromUrl('brands'));
    const categories = _sidebar.categories.length > 0
      ? _sidebar.categories
      : parseNumList(fromUrl('categories'));

    const storePriceCustom = _sidebar.priceRange.join('') !== PRICE_RANGE.join('');
    let priceRange: number[] | null = storePriceCustom ? _sidebar.priceRange : null;
    if (!priceRange) {
      const p = fromUrl('priceRange');
      if (p) {
        const r = p.split(',').filter(Boolean).map(Number);
        if (r.length === 2 && r.join('') !== PRICE_RANGE.join('')) priceRange = r;
      }
    }

    const on_sale = _sidebar.on_sale || fromUrl('on_sale') === 'true';
    const in_stock = _sidebar.in_stock || fromUrl('in_stock') === 'true';
    const sort = _sidebar.sort || fromUrl('sort') || '';

    let variationsSource: Record<string, string[]> = _sidebar.variations;
    if (Object.keys(variationsSource).length === 0 && urlParams) {
      const fromUrlVars: Record<string, string[]> = {};
      urlParams.forEach((value, key) => {
        if (key.startsWith('variation_') && value) {
          fromUrlVars[key.replace('variation_', '')] = value.split(',').filter(Boolean);
        }
      });
      if (Object.keys(fromUrlVars).length > 0) variationsSource = fromUrlVars;
    }

    const currentPage = uiState.product?.page;
    const params: Record<string, string | undefined> = {
      query: uiState.product?.query || undefined,
      categories: categories.length > 0 ? categories.join(',') : undefined,
      brands: brands.length > 0 ? brands.join(',') : undefined,
      priceRange: priceRange ? priceRange.join(',') : undefined,
      on_sale: on_sale ? 'true' : undefined,
      in_stock: in_stock ? 'true' : undefined,
      sort: sort || undefined,
      page: currentPage && currentPage > 1 ? String(currentPage) : undefined,
    };

    Object.entries(variationsSource).forEach(([attribute, values]) => {
      if (values && values.length > 0) {
        params[`variation_${attribute}`] = values.join(',');
      }
    });

    return Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined));
  }, []);

  // Map URL → InstantSearch UiState + Zustand store. We do TWO things:
  //   1. Return UiState that mirrors the URL params synchronously, so
  //      InstantSearch's canonical UiState is correct on the very first
  //      render (no shared-link strip on mount).
  //   2. Schedule a microtask that fully resets the store from the URL —
  //      including clearing fields the URL omits, which fixes back/forward
  //      navigation. The deferral avoids React's setState-in-render warning.
  const routeToState = useCallback((routeState: any) => {
    const ui = {
      query: routeState?.query || '',
      categories: routeState?.categories
        ? routeState.categories.split(',').filter(Boolean).map(Number)
        : [],
      brands: routeState?.brands
        ? routeState.brands.split(',').filter(Boolean).map(Number)
        : [],
      priceRange: (() => {
        if (!routeState?.priceRange) return PRICE_RANGE;
        const range = routeState.priceRange.split(',').filter(Boolean).map(Number);
        return range.length === 2 ? range : PRICE_RANGE;
      })(),
      on_sale: routeState?.on_sale === 'true',
      in_stock: routeState?.in_stock === 'true',
      sort: routeState?.sort || '',
      variations: (() => {
        const v: Record<string, string[]> = {};
        Object.keys(routeState || {}).forEach(key => {
          if (key.startsWith('variation_') && routeState[key]) {
            v[key.replace('variation_', '')] = routeState[key].split(',').filter(Boolean);
          }
        });
        return v;
      })(),
      page: (() => { const n = Number(routeState?.page); return Number.isInteger(n) && n > 1 ? n : undefined; })(),
    };

    queueMicrotask(() => {
      // Full reset — fields not present in URL go back to default. Single
      // setState call so subscribers re-render once.
      // Bail out when values are unchanged to avoid triggering differedSidebar
      // on every pagination click, which causes setFilterQuery to fire 800 ms
      // later and can race with a live Typesense response to reset the page.
      useStore.setState((state) => {
        const sb = state.sidebar;
        if (
          sb.on_sale === ui.on_sale &&
          sb.in_stock === ui.in_stock &&
          sb.sort === ui.sort &&
          sb.priceRange.join(',') === ui.priceRange.join(',') &&
          arrEq(sb.categories, ui.categories) &&
          arrEq(sb.brands, ui.brands) &&
          variationsEq(sb.variations, ui.variations)
        ) {
          return state;
        }
        return {
          ...state,
          sidebar: {
            ...state.sidebar,
            categories: ui.categories,
            brands: ui.brands,
            priceRange: ui.priceRange,
            on_sale: ui.on_sale,
            in_stock: ui.in_stock,
            sort: ui.sort,
            variations: ui.variations,
          },
        };
      });
    });

    return { product: ui };
  }, []);

  // Create reactive stateMapping that updates when sidebar changes
  return (
    <div>
      <InstantSearchNext
        stalledSearchDelay={200}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        routing={{
          router: {
            // LOAD-BEARING: must stay `false` while the custom `push` below has
            // no dispose guard. The default push in react-instantsearch-nextjs
            // skips `write({})` when `isDisposed && isUnmounting.current`; our
            // override drops that check because `cleanUrlOnDispose: false`
            // prevents IS from ever scheduling a dispose-time write. Flipping
            // this back to `true` would cause IS to push the bare path through
            // `router.push` mid-unmount, navigating users away unexpectedly.
            cleanUrlOnDispose: false,
            writeDelay: 0,
            // Route URL writes through Next.js's router instead of the default
            // history.pushState. On live, the default path raced with Next.js's
            // own navigation handling for ?page=N — the param appeared then was
            // wiped on the first click. router.push stays inside Next.js's
            // navigation pipeline so the URL update isn't reverted, and keeps
            // the browser back/forward buttons working across pagination.
            push(url: string) {
              const parsed = new URL(url, window.location.href);
              const target = parsed.pathname + parsed.search + parsed.hash;
              router.push(target, { scroll: false });
            },
          },
          stateMapping: {
            stateToRoute,
            routeToState,
          },
        }}
        searchClient={typesenseInstantSearchAdapter.searchClient}
        indexName="product"
      >
        {/* @ts-expect-error - filters prop is valid with Typesense adapter */}
        <Configure filters={filterQuery} hitsPerPage={hitsPerPage} />
        {/* <InstantSearchComponent
        searchClient={searchClient}
        indexName="product"
        future={{ preserveSharedStateOnUnmount: false }}
        // @ts-ignore
        routing={{
          router: {
            cleanUrlOnDispose: true,
          },
        }}
      > */}

        <div className="flex lg:gap-6 flex-col">
          <SearchInput bindToStore={bindToStore} show={search} />

          <div className='flex overflow-x-auto lg:hidden w-full'>
            <MobileFilterSheet category={category}
              brand={brand}
              categories={categories}
              brands={brands}
              sort={sort} />
          </div>
          <div className='grid grid-cols-12 gap-4'>

            <div className={filters ? 'hidden lg:block lg:col-span-3' : 'hidden'}>
              {typeof window !== 'undefined' && (
                <DelayedRender delay={5000}>
                  <SortInput />
                </DelayedRender>
              )}
              {filters && (
                <TabFilters
                  category={category}
                  brand={brand}
                  categories={categories}
                  brands={brands}
                  sort={sort}
                  dealsType={dealsType}
                />
              )}
            </div>

            <div className={filters ? 'col-span-12 lg:col-span-9' : 'col-span-12'}>
              <ProductGridInstant
                hitsPerPage={hitsPerPage}
                setHitsPerPage={setHitsPerPage}
              />
            </div>

          </div>
        </div>
      </InstantSearchNext>
    </div>
  );
};

export default InstantSearchWrapper;
