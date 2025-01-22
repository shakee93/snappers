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
  tag
}: InstantSearchWrapperProps) => {
  const { sidebar, setSearchMounted } = useStore();
  const [differedSidebar] = useDebounce(sidebar, 800);
  const [hitsPerPage, setHitsPerPage] = useState<number>(10);

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
      tag
        ? `productTags.nodes.slug:${tag}`
        : null,
    ];

    // console.log({ f });

    return f.filter((n) => n).join(" && ");
  };

  // console.log({ category });

  const [filterQuery, setFilterQuery] = useState<string>(getFilterQuery);

  const searchClient = useMemo(() => {
    // console.log('Creating Typesense client with config:', typesenseConfig);
    const typesenseInstantSearchAdapter = new TypesenseInstantSearchAdapter({
      server: {
        apiKey: "xyz", // Be sure to use an API key that only allows search operations
        nodes: [typesenseConfig],
        cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
        retryIntervalSeconds: 500, // Set to 0 to disable retries
        numRetries: 3000,
        connectionTimeoutSeconds: 10,
      },
      additionalSearchParameters: {
        query_by: "name, description",
        exclude_fields:
          "description, productTags, shortDescription, galleryImages, attributes",
        use_cache: false,
      },
    });

    // console.log('Typesense client created successfully');
    return typesenseInstantSearchAdapter.searchClient;
  }, []);

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
    // console.log(filterQuery);
  }, [filterQuery]);

  useEffect(() => {
    setSearchMounted();
  }, []);

  //   const InstantSearchComponent = useMemo(() => {
  //     return server ? InstantSearchNext : InstantSearch;
  // }, [server]); // Add dependencies if necessary

  const InstantSearchComponent = useMemo(() => {
    // TODO: Search on client size freezes when using useInstantSearch hook so switching between normal and next.
    // when this gets fixed update the package
    return server ? InstantSearchNext : InstantSearch;
  }, []);


  return (
    <div>
      <InstantSearchComponent
        stalledSearchDelay={200}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        // @ts-ignore
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
              <Configure filters={filterQuery} hitsPerPage={hitsPerPage} />
            </div>
            <div className='col-span-12 lg:col-span-9'>
              <div className="mb-4">
                <label htmlFor="hitsPerPage" className="mr-2">Results per page:</label>
                <select
                  id="hitsPerPage"
                  value={hitsPerPage}
                  onChange={(e) => setHitsPerPage(Number(e.target.value))}
                  className="border rounded p-2 w-20 text-sm rounded-md border 
                  cursor-pointer border border-2"
                >
                  <option className="text-sm p-2" value={10}>10</option>
                  <option className="text-sm p-2" value={20}>20</option>
                  <option className="text-sm p-2" value={50}>50</option>
                  <option className="text-sm p-2" value={100}>100</option>
                </select>
              </div>
              <ProductGridInstant />
            </div>
          </div>
        </div>
      </InstantSearchComponent>
    </div>
  );
};

export default InstantSearchWrapper;
