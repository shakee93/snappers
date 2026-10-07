"use client";

import { ApolloLink, from, HttpLink, Observable } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support";
import { GraphQLClient } from "graphql-request";

import { GET_AUTH_TOKEN } from "./defs/auth";
import {
  AUTH_TOKEN_KEY,
  AUTH_INVALIDATED_EVENT,
  REFRESH_TOKEN_KEY,
  SESSION_TOKEN_KEY,
  USER_DATA_KEY,
} from "@/utils/storage-keys";
import { onError } from "@apollo/client/link/error";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { readUsableAuthToken } from "@/lib/clientAuthToken";
import { Results } from "@/types";

loadDevMessages();
loadErrorMessages();

export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  function makeClient() {
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
    let tokenSetter: any;

    async function fetchAuthToken() {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        new Error("refresh token missing");
      }

      return await refreshAuthToken(refreshToken || undefined);
    }

    // Unauthenticated entry points: these establish a session and must NOT
    // carry a (possibly stale/expired) Bearer token. The backend now reads the
    // Authorization header (mod_php auth-header bridge), so an invalid token on
    // these makes login/register/refresh fail with "Internal server error".
    const AUTH_FREE_OPERATIONS = new Set([
      "RefreshAuthToken",
      "SendPasswordResetEmail",
      "ResetUserPassword",
      "AuthProviders",
      "RequestOtp",
      "VerifyOtp",
      "CreateAuthNonce",
      "SignInWithGoogle",
    ]);

    const authLink = new ApolloLink((operation, forward) => {
      const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const authToken = readUsableAuthToken(AUTH_TOKEN_KEY);
      const skipAuth = AUTH_FREE_OPERATIONS.has(operation.operationName);

      operation.setContext({
        headers: {
          ...(sessionToken && {
            "woocommerce-session": `Session ${sessionToken}`,
          }),
          ...(authToken &&
            !skipAuth && {
              Authorization: `Bearer ${authToken}`,
            }),
        },
      });

      return forward(operation);
    });

    // WooGraphQL signs and returns a fresh `woocommerce-session` JWT in the
    // response header on every request that mutates session state. Capture
    // that header and persist it so the next request uses the live token —
    // without this, localStorage drifts from WC's actual active session and
    // mutations like checkout / removeItemsFromCart fail with "Sorry, no
    // session found." or "No items in cart to remove."
    //
    // Browsers only expose response headers listed in
    // `Access-Control-Expose-Headers`. WPGraphQL-Woo adds `woocommerce-session`
    // to that list, but verify the proxy chain (Coolify / Traefik / mu-plugin)
    // preserves it — `headers.get(...)` returns null otherwise.
    const sessionAfterware = new ApolloLink((operation, forward) =>
      forward(operation).map((response) => {
        if (typeof window === "undefined") return response;
        const headers = operation.getContext().response?.headers;
        const next = headers?.get?.("woocommerce-session");
        if (next && next !== "false") {
          // Strip any "Session " prefix WC may include, and ignore no-ops.
          const cleaned = next.replace(/^Session\s+/i, "").trim();
          if (cleaned && cleaned !== localStorage.getItem(SESSION_TOKEN_KEY)) {
            localStorage.setItem(SESSION_TOKEN_KEY, cleaned);
          }
        }
        return response;
      })
    );

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
          const errorMessage = err?.extensions?.debugMessage || err?.message;
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
              .catch((error) => {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(SESSION_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                // Tell SessionProvider to clear in-memory customer/session state.
                window.dispatchEvent(new Event(AUTH_INVALIDATED_EVENT));
                observer.error(error);
              });
          });
        }

        if (networkError) {

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

    return new ApolloClient({
      devtools: {
        enabled: process.env.NODE_ENV !== 'production',
      },
      cache: new InMemoryCache(),
      link: from([
        ...(typeof window === "undefined"
          ? [
            new SSRMultipartLink({
              stripDefer: true,
            }),
          ]
          : []),
        authLink,
        sessionAfterware,
        errorLink,
        httpLink,
      ]),
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
