import {ApolloClient, FetchPolicy, from, HttpLink, InMemoryCache} from "@apollo/client";
import {registerApolloClient} from "@apollo/experimental-nextjs-app-support";
import {RetryLink} from "@apollo/client/link/retry";

export const { getClient } = registerApolloClient(() => {

    const retryLink = new RetryLink();

    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
        fetchOptions: {
            // Default TTL for SSR GraphQL fetches. Override per-call via
            // `context: { fetchOptions: { next: { revalidate: N } } }` for
            // stock/price-sensitive queries, or `cache: 'no-store'` for
            // anything auth-scoped.
            //
            // Caching here relies on Next hashing the fetch body into the
            // cache key, so this SSR client MUST stay anonymous — don't add
            // an authLink, per-user variables, or cookies to requests that
            // go through it, or responses will either leak across users or
            // blow up cache-key cardinality. Move anything user-scoped to
            // the client Apollo in graphql/apollo-client.tsx.
            //
            // For WP-driven invalidation, the path forward is
            // `next: { tags: [...] }` + `revalidateTag()` from a WP webhook.
            next: { revalidate: 300 },
        },
    })

    let cacheType: FetchPolicy = 'no-cache'

    return new ApolloClient({
        devtools: {
            enabled: false,
        },
        cache: new InMemoryCache(),
        link: from([
            retryLink,
            httpLink
        ]),
        defaultOptions : {
            watchQuery: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'ignore',
            },
            query: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
        }
    });
});