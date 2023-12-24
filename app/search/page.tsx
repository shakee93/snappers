"use client"
import {Search} from "lucide-react";
import {
    Hits,
    InstantSearch,
    InstantSearchSSRProvider,
    RefinementList,
    useHits,
    useSearchBox
} from 'react-instantsearch';
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import {useCallback} from "react";
import {Hit} from "instantsearch.js";
import {InstantSearchNext} from "react-instantsearch-nextjs";




function SearchResults( ) {

    const { hits } = useHits();

    return <>
        {hits.map((hit: Hit) => <pre key={hit.objectID}>{JSON.stringify(hit.post_thumbnail)}</pre>)}
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
                host: "192.168.1.77",
                port: 8108,
                path: "", // Optional. Example: If you have your typesense mounted in localhost:8108/typesense, path should be equal to '/typesense'
                protocol: "http",
            },
        ],
        cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
    },
    // The following parameters are directly passed to Typesense's search API endpoint.
    //  So you can pass any parameters supported by the search endpoint below.
    //  query_by is required.
    additionalSearchParameters: {
        query_by: "post_title,post_content",
    },
});

function Page() {



    const searchClient = typesenseInstantSearchAdapter.searchClient;

    return <div className='container py-16'>
        <InstantSearchNext  future={{
            preserveSharedStateOnUnmount: true
        }} routing searchClient={searchClient} indexName={"product"}>
            <SearchBox/>
            <SearchResults/>
        </InstantSearchNext>
    </div>
}

export default Page
