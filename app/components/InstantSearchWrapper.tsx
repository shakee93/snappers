"use client";
import { Configure, InstantSearch, RefinementList } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter, { BaseSearchParameters } from "typesense-instantsearch-adapter";
import ProductGridInstant from "@/app/components/ProductGridInstant";
import SearchInput from "@/app/components/SearchInput";
import TabFilters from "@/app/components/TabFilters";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { PRICE_RANGE } from "@/app/components/Filters/PriceFilter";
import SortInput from "@/app/components/SortInput";
import { useDebounce } from "use-debounce";
import MobileFilterSheet from "@/app/components/MobileFilterSheet";

const DelayedRender: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // console.log('DelayedRender');
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

type CustomSearchParameters = Omit<BaseSearchParameters, "filter_by"> & {
  filter_by?: string;
};

const typesenseConfig = {
  host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || "api.gqmobiles.lk",
  port: (process.env.NEXT_PUBLIC_TYPESENSE_PORT as unknown as number) || 80,
  path: process.env.NEXT_PUBLIC_TYPESENSE_PATH || "",
  protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
};

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
  const { sidebar, setSearchMounted } = useStore();
  const [differedSidebar] = useDebounce(sidebar, 800);
  const [hitsPerPage, setHitsPerPage] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300); // Debounce the search query

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
      sidebar.in_stock ? "stockStatus:IN_STOCK" : null,
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

    // console.log({ f });

    return f.filter((n) => n).join(" && ");
  };

  const [filterQuery, setFilterQuery] = useState<string>(getFilterQuery);

  const searchClient = useMemo(() => {
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
        filter_by: filterQuery,
        sort_by: "in_stock:desc",
        per_page: hitsPerPage,
        prefix: true,
        num_typos: 1,
      },
    });

    return typesenseInstantSearchAdapter.searchClient;
  }, [filterQuery, hitsPerPage]);

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

  useEffect(() => {
    setFilterQuery(getFilterQuery);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    console.log(filterQuery);
  }, [filterQuery]);

  useEffect(() => {
    setSearchMounted();
  }, []);

  // useEffect(() => {
  //   if (searchQueryValue) {
  //     const url = new URL(window.location.href);
  //     url.searchParams.set('q', searchQueryValue);
  //     window.history.replaceState({}, '', url);
  //   }
  // }, [searchQueryValue]);

  //   const InstantSearchComponent = useMemo(() => {
  //     return server ? InstantSearchNext : InstantSearch;
  // }, [server]); // Add dependencies if necessary

  const InstantSearchComponent = useMemo(() => {
    // TODO: Search on client side freezes when using useInstantSearch hook so switching between normal and next.
    // FIXED: I have updated the package to the latest version and it is working fine.
    // KEPT the old code for reference.
    // when this gets fixed update the package
    return server ? InstantSearchNext : InstantSearch;
  }, [server]);

  return (
    <div>
      <InstantSearchNext
        stalledSearchDelay={200}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        routing={
          routing && server
            ? {
              router: {
                cleanUrlOnDispose: true,
              },
            }
            : undefined
        }
        searchClient={searchClient}
        indexName="product"
      >

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
