'use client'
import {Configure, RefinementList, SortBy, useSortBy} from "react-instantsearch";
import {InstantSearchNext} from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import ProductGridInstant from "@/app/components/ProductGridInstant";
import SearchInput from "@/app/components/SearchInput";
import TabFilters from "@/app/components/TabFilters";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useDeferredValue, useEffect, useState} from "react";
import {useStore} from "@/store/store";
import {PRICE_RANGE} from "@/app/components/Filters/PriceFilter";
import Pagination from "@/shared/Pagination/Pagination";


interface InstantSearchWrapperProps {
    search?: boolean
    filters?: boolean
    categories?: ProductCategory[]
    brands?: Brand[]
}

const InstantSearchWrapper = ({
                                  search = false,
                                  filters = false,
                                  categories,
                                  brands
                              }: InstantSearchWrapperProps) => {
    
    const { sidebar } = useStore()
    const [filterQuery, setFilterQuery] = useState("")
    const [page, setPage] = useState(1)
    const [sortQuery, setSortQuery] = useState<undefined | string>("")
    const differedSidebar = useDeferredValue(sidebar)

    
    useEffect(() => {
        const f =[
            sidebar.priceRange !== PRICE_RANGE ?`rawPrice:[${sidebar.priceRange[0]}..${sidebar.priceRange[1]}]` : null,
            sidebar.categories.length > 0 ? `productCategories.edges.node.databaseId:[${sidebar.categories.join(',')}]` : null,
            sidebar.brands.length > 0 ? `brands.nodes.databaseId:[${sidebar.brands.join(',')}]` : null,
            sidebar.on_sale ? 'onSale:true': null,
            sidebar.in_stock ? 'stockStatus:IN_STOCK': null,
        ]

        setFilterQuery(f.filter(n => n).join(" && "))

        if (differedSidebar.sort) {
            setSortQuery(differedSidebar.sort);
        } else {
            setSortQuery(undefined)
        }
        
        console.log('changed!', f.filter(n => n).join(" && "));

    }, [differedSidebar])

    const makeClient: any = () => {
        try {
            const typesenseInstantSearchAdapter = new TypesenseInstantSearchAdapter({
                server: {
                    apiKey: "xyz", // Be sure to use an API key that only allows search operations
                    nodes: [
                        {
                            // host: "0.0.0.0",
                            host: "52.45.14.64",
                            port: 8108,
                            path: "", // Optional. Example: If you have your typesense mounted in localhost:8108/typesense, path should be equal to '/typesense'
                            protocol: "http",
                        },
                    ],
                    cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
                },
                additionalSearchParameters: {
                    query_by: "name, description",
                    sort_by: sortQuery,
                },
            });

            return typesenseInstantSearchAdapter.searchClient
        }

        catch (e) {
            console.log(e);
        }
    }


    return <InstantSearchNext  future={{
        preserveSharedStateOnUnmount: true
    }} routing={{
        router: {
            cleanUrlOnDispose: false
        }
    }} searchClient={makeClient()} indexName='product' >
        <div className='flex gap-6 flex-col'>
            {search && <SearchInput/>}
            {filters && <TabFilters categories={categories} brands={brands}/>}
            <Configure  filters={filterQuery} hitsPerPage={12}/>
            {/*<RefinementList attribute="brands.nodes"/>*/}
            <ProductGridInstant/>
        </div>
    </InstantSearchNext>
}

export default InstantSearchWrapper