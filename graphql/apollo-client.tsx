"use client";

import { ApolloLink, from, HttpLink, Observable } from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { GraphQLClient } from "graphql-request";
import { jwtDecode } from "jwt-decode";

import { GET_AUTH_TOKEN } from "./defs/auth";
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  SESSION_TOKEN_KEY,
  USER_DATA_KEY,
} from "@/context/SessionProvider";
import { onError } from "@apollo/client/link/error";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { Results } from "@/types";

loadDevMessages();
loadErrorMessages();

export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  function makeClient() {
    // Global promise to prevent concurrent token refreshes
    let refreshPromise: Promise<string> | null = null;

    // Check if token is expired or will expire within 5 minutes
    function isTokenExpiredOrExpiring(token: string): boolean {
      try {
        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;
        const expirationTime = decoded.exp;
        const bufferTime = 5 * 60; // 5 minutes buffer
        
        return !expirationTime || (expirationTime - bufferTime) <= now;
      } catch (error) {
        console.error('Error decoding token:', error);
        return true; // Treat invalid tokens as expired
      }
    }

    // Check if refresh token is expired
    function isRefreshTokenExpired(refreshToken: string): boolean {
      try {
        const decoded: any = jwtDecode(refreshToken);
        const now = Date.now() / 1000;
        return !decoded.exp || decoded.exp <= now;
      } catch (error) {
        console.error('Error decoding refresh token:', error);
        return true;
      }
    }

    async function refreshAuthToken(refreshToken?: string) {
      const graphQLClient = new GraphQLClient(
        process.env.NEXT_PUBLIC_WP_GRAPHQL || ""
      );

      const results = (await graphQLClient.request(GET_AUTH_TOKEN, {
        refreshToken,
      })) as Results;

      const authToken = results?.refreshJwtAuthToken?.authToken;

      if (!authToken) {
        throw new Error("Failed to retrieve a new auth token");
      }

      localStorage.setItem(AUTH_TOKEN_KEY, authToken);

      return authToken;
    }

    async function fetchAuthToken() {
      // Prevent concurrent refresh attempts
      if (refreshPromise) {
        console.log('Token refresh already in progress, waiting...');
        return refreshPromise;
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error("refresh token missing");
      }

      // Check if refresh token itself is expired
      if (isRefreshTokenExpired(refreshToken)) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        throw new Error("Refresh token expired, please login again");
      }

      // Create the refresh promise
      refreshPromise = refreshAuthToken(refreshToken)
        .finally(() => {
          // Reset the promise after completion
          refreshPromise = null;
        });

      return refreshPromise;
    }

    const authLink = new ApolloLink((operation, forward) => {
      const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const authToken = localStorage.getItem(AUTH_TOKEN_KEY);

      // Proactive token refresh if token is expiring soon
      if (authToken && isTokenExpiredOrExpiring(authToken)) {
        console.log('Token is expiring soon, refreshing proactively...');
        return new Observable((observer) => {
          fetchAuthToken()
            .then((newToken) => {
              operation.setContext({
                headers: {
                  ...(sessionToken && {
                    "woocommerce-session": `Session ${sessionToken}`,
                  }),
                  Authorization: `Bearer ${newToken}`,
                },
              });
              
              // Forward the operation with the new token
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };
              forward(operation).subscribe(subscriber);
            })
            .catch((error) => {
              console.error('Proactive token refresh failed:', error);
              observer.error(error);
            });
        });
      }

      // Normal flow with current token
      operation.setContext({
        headers: {
          ...(sessionToken && {
            "woocommerce-session": `Session ${sessionToken}`,
          }),
          ...(authToken && {
            Authorization: `Bearer ${authToken}`,
          }),
        },
      });

      return forward(operation);
    });

    const errorLink = onError(
      ({ graphQLErrors, operation, forward, networkError }) => {

        const targetErrors = [
          "The iss do not match with this server",
          "invalid-secret-key | Expired token",
          "invalid-secret-key | Signature verification failed",
          "Expired token",
          "Wrong number of segments",
        ];

        let isTargetError = graphQLErrors && graphQLErrors.some((err: any) => {
          const errorMessage = err?.extensions?.debugMessage || err?.message ;
          return targetErrors.includes(errorMessage) || errorMessage.includes("invalid-secret-key");
        });


        if (
          isTargetError
        ) {
          return new Observable((observer) => {
            fetchAuthToken()
              .then((newToken) => {
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    Authorization: `Bearer ${newToken}`, // Update the authorization header
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
              .catch((error) => {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(SESSION_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                
                // Redirect to login page or show appropriate error
                if (typeof window !== 'undefined') {
                  window.location.href = '/login';
                }

                observer.error(error);
              });
          });
        }

        if (networkError) {
          console.log(`[Network error]: ${networkError}`);
          
          // Check if it's a JSON parsing error indicating PHP output
          if (networkError.message && networkError.message.includes("Unexpected token")) {
            console.error("🚨 WordPress is returning PHP output instead of JSON. Check your WordPress debug settings and plugins.");
            console.error("This usually means PHP errors/warnings are being output before the GraphQL response.");
            console.error("Check your wp-config.php file and ensure WP_DEBUG_DISPLAY is set to false.");
          }
        }
      }
    );

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
        ...(typeof window === "undefined"
          ? [
              new SSRMultipartLink({
                stripDefer: true,
              }),
            ]
          : []),
        authLink,
        errorLink,
        httpLink,
      ] as any),
      defaultOptions: {
        watchQuery: {
          // fetchPolicy: 'no-cache',
        },
        query: {
          // fetchPolicy: 'no-cache',
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
