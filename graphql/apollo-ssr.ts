import {ApolloClient, from, HttpLink, InMemoryCache, Observable} from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import {onError} from "@apollo/client/link/error";
import {RetryLink} from "@apollo/client/link/retry";

export const { getClient } = registerApolloClient(() => {

    const retryLink = new RetryLink();

    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
    })

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: from([
            // retryLink,
            httpLink
        ]),
        defaultOptions : {
            watchQuery: {
                fetchPolicy: 'no-cache',
                // errorPolicy: 'ignore',
            },
            query: {
                fetchPolicy: 'no-cache',
                // errorPolicy: 'all',
            },
        }
    });
});