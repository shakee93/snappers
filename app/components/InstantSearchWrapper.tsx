'use client'
import {Configure} from "react-instantsearch";
import {InstantSearchNext} from "react-instantsearch-nextjs";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import ProductGridInstant from "@/app/components/ProductGridInstant";
import SearchInput from "@/app/components/SearchInput";
import TabFilters from "@/app/components/TabFilters";
import {Brand, ProductCategory} from "@/graphql/types/graphql";


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
                },
            });

            const searchClient = typesenseInstantSearchAdapter.searchClient

            return searchClient
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
            <Configure filters={'rawPrice:=[3900..500000] && type:VARIABLE'} hitsPerPage={12}/>
            <ProductGridInstant/>
        </div>
    </InstantSearchNext>
}

export default InstantSearchWrapper