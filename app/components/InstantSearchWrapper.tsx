"use client";
import { Configure, InstantSearch, RefinementList } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import ProductGridInstant from "@/app/components/ProductGridInstant";
import SearchInput from "@/app/components/SearchInput";
import TabFilters from "@/app/components/TabFilters";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { PRICE_RANGE } from "@/app/components/Filters/PriceFilter";
import SortInput from "@/app/components/SortInput";
import { useDebounce } from "use-debounce";

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
  sort?:boolean;
}

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
  sort
}: InstantSearchWrapperProps) => {
  const { sidebar, setSearchMounted } = useStore();
  const [differedSidebar] = useDebounce(sidebar, 800);

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
    ];

    return f.filter((n) => n).join(" && ");
  };


  const [filterQuery, setFilterQuery] = useState<string>(getFilterQuery);

  const searchClient = useMemo(() => {
    const typesenseInstantSearchAdapter = new TypesenseInstantSearchAdapter({
      server: {
        apiKey: "xyz", // Be sure to use an API key that only allows search operations
        nodes: [typesenseConfig],
        cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
      },
      additionalSearchParameters: {
        query_by: "name, description",
        exclude_fields:
          "description, productTags, shortDescription, galleryImages, attributes",
        use_cache: false,
      },
    });

    return typesenseInstantSearchAdapter.searchClient;
  }, []);

  useEffect(() => {
    setFilterQuery(getFilterQuery);
    // setSortQuery(differedSidebar.sort);
  }, [differedSidebar]);

  useEffect(() => {
    console.log(filterQuery);
  }, [filterQuery]);

  useEffect(() => {
    setSearchMounted();
  }, []);

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
        <div className="flex gap-6 flex-col">
          <SearchInput bindToStore={bindToStore} show={search} />
          <SortInput />
          {filters && (
            <TabFilters
              category={category}
              brand={brand}
              categories={categories}
              brands={brands}
              sort={sort}
            />
          )}
          <Configure filters={filterQuery} hitsPerPage={12} />
          <ProductGridInstant />
        </div>
      </InstantSearchComponent>
    </div>
  );
};

export default InstantSearchWrapper;
