'use client'
import {Search} from "lucide-react";
import {
    Configure,
    Index,
    useHits,
    useSearchBox
} from 'react-instantsearch';
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import {Hit} from "instantsearch.js";
import {InstantSearchNext} from "react-instantsearch-nextjs";
import ProductCard from "@/app/components/ProductCard3";
import {Product} from "@/graphql/types/graphql";


function SearchResultsCategory( ) {

    const { hits } = useHits();
    
    return <>
        <div className="flex-1 grid pt-8 sm:grid-cols-4 lg:grid-cols-4 gap-x-8 gap-y-10">
            {hits.map((item: Hit, index: number) =>
                <div key={item.objectID}>{item.posts_count} - {item.post_title}</div>
            )}
        </div>
    </>;
}

function SearchResults( ) {

    const { hits } = useHits();

    return <>
        <div className="flex-1 grid pt-8 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
            {hits.map((item: Hit, index: number) =>
                <ProductCard  key={item.slug} data={item as unknown as Product} />
            )}
        </div>
    </>;
}

function SearchBox() {
    const {
        query,
        refine,
        clear,
        // Deprecated
    } = useSearchBox();

    return  <form
        className="flex-1 text-primary-700"
    >
        <div className="bg-primaryColor/5 border border-primaryColor/20 py-2 flex items-center space-x-1.5 px-5 rounded-2xl h-full ">
            <Search className='text-primaryColor' />
            <input
                type="text"
                placeholder="Type to Quick Search"
                defaultValue={query}
                onChange={e => refine(e.target.value)}
                className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm"
                autoFocus
            />
        </div>
        <input type="submit" hidden value="" />
    </form>
}

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

function Page() {



    const searchClient = typesenseInstantSearchAdapter.searchClient;

    return <div className='container py-16'>
        <InstantSearchNext  future={{
            preserveSharedStateOnUnmount: true
        }} routing={{
            router: {
                cleanUrlOnDispose: false
            }
        }} searchClient={searchClient} indexName='product' >
            <SearchBox/>
            <Configure filters={'rawPrice:=[3900..500000] && productCategories.edges.node.slug:smart-phones'} hitsPerPage={12}/>
            <SearchResults/>
        </InstantSearchNext>
    </div>
}

export default Page
