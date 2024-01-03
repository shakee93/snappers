"use client";

import {
  ApolloLink,
  from,
  HttpLink, Observable,
  useMutation,
} from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { GraphQLClient } from 'graphql-request';

import { GET_AUTH_TOKEN } from "./defs/auth";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_TOKEN_KEY } from "@/context/SessionProvider";
import { onError } from "@apollo/client/link/error";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { Results } from "@/types";


loadDevMessages();
loadErrorMessages();

export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  function makeClient() {

    async function refreshAuthToken(refreshToken?: string) {
      const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_WP_GRAPHQL || "");

      const results = await graphQLClient.request(GET_AUTH_TOKEN, { refreshToken }) as Results;

      const authToken = results?.refreshJwtAuthToken?.authToken;

      if (!authToken) {
        throw new Error("Failed to retrieve a new auth token");
      }

      localStorage.setItem(AUTH_TOKEN_KEY, authToken)

      return authToken;
    }
    let tokenSetter: any;

    async function fetchAuthToken() {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        new Error('refresh token missing');
      }

      return await refreshAuthToken(refreshToken || undefined);
    }

    const authLink = new ApolloLink((operation, forward) => {

      const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const authToken = localStorage.getItem(AUTH_TOKEN_KEY);

      operation.setContext({
        headers: {
          ...(sessionToken && {
            'woocommerce-session': `Session ${sessionToken}`,
          }),
          ...(authToken && {
            Authorization: `Bearer ${authToken}`
          })
        },
      });

      return forward(operation);
    });


    const errorLink = onError(({ graphQLErrors, operation, forward, networkError }) => {
      const targetErrors = [
        'The iss do not match with this server',
        'invalid-secret-key | Expired token',  
        'invalid-secret-key | Signature verification failed',
        'Expired token',
        'Wrong number of segments',
      ];


      if (graphQLErrors && graphQLErrors.some((err: any) => targetErrors.includes(err?.debugMessage))) {
        return new Observable(observer => {
          fetchAuthToken()
            .then(newToken => {

              console.log('newToken', newToken);
              // Update the context with the new token
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: `Bearer ${newToken}`, // Update the authorization header
                },
              }));
            })
            .then(() => {
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };

              // Retry the request
              forward(operation).subscribe(subscriber);
            })
            .catch(error => {
              // Handle token refresh errors
              observer.error(error);
            });
        });
      }

      console.log(graphQLErrors);

      if (networkError) console.log(`[Network error]: ${networkError}`);
    });

    const httpLink = new HttpLink({
      // This needs to be an absolute URL, as relative URLs cannot be used in SSR
      uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
      fetchOptions: {
        // cache: "no-store",
      },
      // You can disable result caching here if you want to
      // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
      // fetchOptions: { cache: "no-store" },
      // You can override the default `fetchOptions` on a per-query basis
      // via the `context` property on the options passed as a second argument
      // to an Apollo Client data fetching hook, e.g.:
      // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
    });


    return new NextSSRApolloClient({
      // Use the `NextSSRInMemoryCache`, not the normal `InMemoryCache`
      connectToDevTools: true,
      cache: new NextSSRInMemoryCache(),
      link: from([
        ...(typeof window === "undefined" ? [new SSRMultipartLink({
          stripDefer: true,
        })] : []),
        authLink,
        errorLink,
        httpLink
      ]),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    });
  }

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}