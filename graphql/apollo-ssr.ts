import {ApolloClient, from, HttpLink, InMemoryCache} from "@apollo/client";
import {registerApolloClient} from "@apollo/experimental-nextjs-app-support";
import {RetryLink} from "@apollo/client/link/retry";

export const { getClient } = registerApolloClient(() => {

    // Retry true network failures (timeouts, DNS, connection reset) AND HTTP 429.
    // We still DON'T retry 5xx - retrying those during a spike amplifies backend
    // load and turns one failed request into a retry storm. 429 is different:
    // it's the backend explicitly saying "slow down", so a bounded, backed-off
    // retry is the correct response. This matters most during the build's
    // static-generation burst, where WPGraphQL rate-limits concurrent requests
    // and an un-retried 429 hard-fails whichever page hits it first.
    const retryLink = new RetryLink({
        attempts: {
            max: 4, // 1 original + 3 retries (backed off) for transient 429s
            retryIf: (error) => {
                if (!error) return false;
                const statusCode = (error as { statusCode?: number }).statusCode;
                // Server responded with a status: only retry the explicit
                // rate-limit code (429); never 5xx (see comment above).
                if (statusCode !== undefined) return statusCode === 429;
                // GraphQL-level errors (validation, resolver failures) carry
                // graphQLErrors and no statusCode. They are not transport
                // failures - retrying just repeats the same failure, so skip.
                const graphQLErrors = (error as { graphQLErrors?: readonly unknown[] }).graphQLErrors;
                if (graphQLErrors && graphQLErrors.length > 0) return false;
                // No statusCode and no GraphQL errors = true network failure
                // (timeout, DNS, connection reset) → retry.
                return true;
            },
        },
        delay: { initial: 500, max: 5000, jitter: true },
    });

    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
        fetchOptions: {
            // Indefinite Vercel cache - busted by the WP → /api/revalidate
            // webhook on product / category / content edits. This is the
            // setup that ran from 2024-01-30 to 2026-04-22 with no issues,
            // before the TTL-based experiments that replaced it.
            //
            // No backstop TTL: if the webhook is ever missed, the entry
            // stays cached until the next deploy or another webhook hit on
            // the same path. That tradeoff is the entire point - the
            // webhook is the source of truth for invalidation, and it
            // covers products, categories, and homepage paths.
            //
            // Caching here relies on Next hashing the fetch body into the
            // cache key, so this SSR client MUST stay anonymous - don't add
            // an authLink, per-user variables, or cookies to requests that
            // go through it, or responses will either leak across users or
            // blow up cache-key cardinality. Move anything user-scoped to
            // the client Apollo in graphql/apollo-client.tsx.
            cache: 'force-cache',
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
        // entirely - the raw network response is returned with all fragment
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
