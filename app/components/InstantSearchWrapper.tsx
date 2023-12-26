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


interface InstantSearchWrapperProps {
    search?: boolean
    filters?: boolean
    categories?: ProductCategory[]
    brands?: Brand[]
}

function CustomSortBy() {
    const { sidebar: { sort } } = useStore()
    
    const {
        initialIndex,
        currentRefinement,
        options,
        refine,
        canRefine,
    } = useSortBy({
        items: [
            { label: 'Featured', value: 'instant_search' },
            { label: 'Price (asc)', value: 'instant_search_price_asc' },
            { label: 'Price (desc)', value: 'instant_search_price_desc' },
        ],
    });
    
    
    useEffect(() => {
        console.log(currentRefinement);
        // refine('name:asc')
    }, [sort])
    

    return <>{/* Your JSX */}</>;
}

const InstantSearchWrapper = ({
                                  search = false,
                                  filters = false,
                                  categories,
                                  brands
                              }: InstantSearchWrapperProps) => {
    
    const { sidebar } = useStore()
    const [filterQuery, setFilterQuery] = useState("")
    const [sortQuery, setSortQuery] = useState("")
    const differedSidebar = useDeferredValue(sidebar)

    
    useEffect(() => {
        const f =[
            `rawPrice:[${sidebar.priceRange[0]}..${sidebar.priceRange[1]}]`,
            sidebar.categories.length > 0 ? `productCategories.edges.node.databaseId:[${sidebar.categories.join(',')}]` : null,
            sidebar.brands.length > 0 ? `brands.nodes.databaseId:[${sidebar.brands.join(',')}]` : null,
            sidebar.on_sale ? 'onSale:true': null
        ]

        setFilterQuery(f.filter(n => n).join(" && "))

        if (differedSidebar.sort) {
            setSortQuery(differedSidebar.sort);
        } else {
            setSortQuery(null)
        }

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
                    sort_by: sortQuery
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