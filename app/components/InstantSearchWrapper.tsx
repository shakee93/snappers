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
import { history } from "instantsearch.js/es/lib/routers";
import { UiState } from "instantsearch.js";
import { useSearchParams } from "next/navigation";

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
  };
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
  searchQueryValue
}: InstantSearchWrapperProps) => {
  const { sidebar, setSearchMounted, syncCategories, syncBrands, synPriceRange, setInStock, syncOnSale, setSort, syncVariations, isTyping } = useStore();
  const [differedSidebar] = useDebounce(sidebar, 800);
  const [hitsPerPage, setHitsPerPage] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchParams = useSearchParams();
  const [debouncedIsTyping] = useDebounce(isTyping, 500);

  useEffect(() => {
    if (searchParams.get('q')) {
      setSearchQuery(searchParams.get('q') || '');
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchMounted();
  }, []);

  const getFilterQuery: () => string = () => {
    const f = [
      sidebar.priceRange.join("") !== PRICE_RANGE.join("")
        ? `rawPrice:[${sidebar.priceRange[0]}..${sidebar.priceRange[1]}]`
        : null,
      category
        ? `productCategories.edges.node.databaseId:${category.databaseId}`
        : sidebar.categories.length > 0
          ? `productCategories.edges.node.databaseId:[${sidebar.categories.join(
            ","
          )}]`
          : null,
      brand
        ? `brands.nodes.databaseId:${brand.databaseId}`
        : sidebar.brands.length > 0
          ? `brands.nodes.databaseId:[${sidebar.brands.join(",")}]`
          : null,
      sidebar.on_sale ? "onSale:true" : null,
      sidebar.in_stock ? "stockStatus:IN_STOCK && productTags.nodes.slug:!=pre-order" : null,
      sidebar.out_of_stock ? "stockStatus:OUT_OF_STOCK" : null,
      tag
        ? `productTags.nodes.slug:${tag}`
        : null,
    ];

    // Add variation filters
    Object.entries(sidebar.variations).forEach(([attribute, values]) => {
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
  }, [differedSidebar]);

  useEffect(() => {
    if (!search) {
      setFilterQuery(getFilterQuery);
    }
    // setSortQuery(differedSidebar.sort);
  }, [search]);

  // this maps the ui state to the route state
  const stateToRoute = useCallback((uiState: CustomUiState) => {

    const _state = useStore.getState();
    const _sidebar = _state.sidebar;

    // Build URL params object
    const params: Record<string, string | undefined> = {
      query: uiState.product.query || undefined,
      categories: _sidebar?.categories?.join(',') || undefined,
      brands: _sidebar?.brands?.join(',') || undefined,
      priceRange: (_sidebar?.priceRange === PRICE_RANGE) ? undefined : _sidebar?.priceRange?.join(',') || undefined,
      on_sale: _sidebar?.on_sale ? 'true' : undefined,
      in_stock: _sidebar?.in_stock ? 'true' : undefined,
      sort: _sidebar?.sort || undefined,
    };

    // Handle variations object
    const variationEntries = Object.entries(_sidebar?.variations || {});
    if (variationEntries.length > 0) {
      variationEntries.forEach(([attribute, values]) => {
        if (values.length > 0) {
          params[`variation_${attribute}`] = values.join(',');
        }
      });
    }

    // Remove undefined values
    return Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined));
  }, [sidebar]);

  // this maps the route state to the ui state
  const routeToState = useCallback((routeState: any) => {

    // Sync categories


    // Sync brands
    if (routeState?.brands?.length > 0) {
      syncBrands(routeState.brands.split(',').filter(Boolean).map(Number) || []);
    }

    // Sync price range
    if (routeState?.priceRange?.length > 0) {
      const priceRange = routeState.priceRange.split(',').filter(Boolean).map(Number);
      if (priceRange.length === 2) {
        synPriceRange(priceRange);
      }
    }

    // Sync on_sale
    if (routeState?.on_sale === 'true') {
      syncOnSale(true);
    }

    // Sync in_stock
    if (routeState?.in_stock === 'true') {
      setInStock(true);
    }

    // Sync sort
    if (routeState?.sort) {
      setSort(routeState.sort);
    }

    // Sync variations
    const variations: Record<string, string[]> = {};
    Object.keys(routeState || {}).forEach(key => {
      if (key.startsWith('variation_')) {
        const attribute = key.replace('variation_', '');
        if (routeState[key]) {
          variations[attribute] = routeState[key].split(',').filter(Boolean);
        }
      }
    });

    // Apply variations to store
    Object.entries(variations).forEach(([attribute, values]) => {
      syncVariations(attribute, values);
    });

    if (routeState?.categories?.length > 0) {
      console.log('sync categories', routeState.categories.split(',').filter(Boolean).map(Number) || []);
      syncCategories(routeState.categories.split(',').filter(Boolean).map(Number) || []);
    }

    return {
      product: {
        query: routeState.query || '',
        categories: sidebar.categories,
        brands: sidebar.brands,
        priceRange: sidebar.priceRange,
        on_sale: sidebar.on_sale,
        in_stock: sidebar.in_stock,
        sort: sidebar.sort,
        variations: sidebar.variations,
      },
    };
  }, [syncCategories, syncBrands, synPriceRange, syncOnSale, setInStock, setSort, syncVariations]);

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
            cleanUrlOnDispose: true,
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
          <SearchInput bindToStore={bindToStore} show={search} onSearchChange={(value) => setSearchQuery(value)} />

          <div className='flex overflow-x-auto lg:hidden w-full'>
            <MobileFilterSheet category={category}
              brand={brand}
              categories={categories}
              brands={brands}
              sort={sort} />
          </div>
          <div className='grid grid-cols-12 gap-4'>

            <div className='col-span-0 lg:col-span-3'>
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
                />
              )}
            </div>

            <div className='col-span-12 lg:col-span-9'>
              <ProductGridInstant hitsPerPage={hitsPerPage} setHitsPerPage={setHitsPerPage} />
            </div>

          </div>
        </div>
      </InstantSearchNext>
    </div>
  );
};

export default InstantSearchWrapper;
