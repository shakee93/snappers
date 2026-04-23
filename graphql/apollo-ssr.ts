import {ApolloClient, from, HttpLink, InMemoryCache} from "@apollo/client";
import {registerApolloClient} from "@apollo/experimental-nextjs-app-support";
import {RetryLink} from "@apollo/client/link/retry";

export const { getClient } = registerApolloClient(() => {

    // Retry only on true network failures (timeouts, DNS, connection reset).
    // Skip retries when the server responded — retrying on 500s amplifies
    // backend load during a spike and turns a single failed request into a
    // retry storm.
    const retryLink = new RetryLink({
        attempts: {
            max: 2, // 1 original + 1 retry
            retryIf: (error) => {
                if (!error) return false;
                // ServerError / ServerParseError from Apollo carry `statusCode`.
                // If we got a response at all, don't retry — it's the server's job.
                return !('statusCode' in error);
            },
        },
        delay: { initial: 300, max: 2000, jitter: true },
    });

    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
        fetchOptions: {
            // Default TTL for SSR GraphQL fetches — listings, archives, editorial.
            // 30 min is the "safe for anything that isn't per-product stock" floor.
            // Override per-call via `context: { fetchOptions: { next: { revalidate: N } } }`
            // for queries where freshness matters more (e.g. PDP at 300s), or
            // `cache: 'no-store'` for anything auth-scoped.
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
            next: { revalidate: 1800 },
        },
    })

    return new ApolloClient({
        devtools: {
            enabled: false,
        },
        cache: new InMemoryCache(),
        link: from([
            retryLink,
            httpLink,
        ]),
        // IMPORTANT: keep `fetchPolicy: 'no-cache'` here. Apollo's default
        // (`cache-first`) uses InMemoryCache normalization, which requires a
        // `possibleTypes` map to resolve `... on SimpleProduct` / `... on
        // VariableProduct` inline fragments on the WPGraphQL `Product`
        // interface. Without that map, fragment fields are silently dropped
        // when reading back from the normalized cache, which on the homepage
        // renders empty product sliders. `no-cache` bypasses normalization
        // entirely — the raw network response is returned with all fragment
        // fields intact. The dedup savings from `cache-first` are small in
        // SSR (per-request client) and not worth the fragility here.
        // Next.js's fetch-layer cache (set via httpLink fetchOptions.next)
        // still caches the raw response, which is where the actual win is.
        defaultOptions: {
            watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'ignore' },
            query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
        },
    });
});
