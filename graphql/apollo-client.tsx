"use client";

import {
  ApolloLink,
  defaultDataIdFromObject,
  FetchResult,
  HttpLink,
  useMutation,
} from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";

import { gql } from "@apollo/client";
import { GET_AUTH_TOKEN } from "./defs/auth";


export function hasCredentials() {
  const authToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!!authToken && !!refreshToken) {
    return true;
  }

  return false;
}

async function refreshAuthToken(refreshToken: string) {
  try {
    const [refresh] = useMutation(GET_AUTH_TOKEN);

    console.log("Refreshing auth token...");
    const results: any = await refresh({
      variables: {
        refreshToken,
      },
    });
    console.log("Refreshed auth token results:", results);

    const authToken = results?.authToken;
    if (!authToken) {
      throw new Error("Failed to retrieve a new auth token");
    }
    return authToken;
  } catch (err) {
    console.error("Error refreshing auth token:", err);
    throw err;
  }
}

async function fetchAuthToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  let authToken;

  if (!refreshToken) {
    // No refresh token means the user is not authenticated.
    return;
  }

  try {
    authToken = await refreshAuthToken(refreshToken);
  } catch (err) {
    console.error("Error fetching auth token:", err);
  }

  if (authToken) {
    // Save token.
    sessionStorage.setItem("authToken", authToken);
    if (tokenSetter) {
      clearInterval(tokenSetter);
    }
    tokenSetter = setInterval(
      async () => {
        if (!hasCredentials()) {
          clearInterval(tokenSetter);
          return;
        }
        fetchAuthToken();
      },
      Number(process.env.AUTH_KEY_TIMEOUT || 30000)
    );
  }

  return authToken;
}

let tokenSetter: any;

export async function getAuthToken() {
  let authToken = localStorage.getItem("authToken");

  if (!authToken || !tokenSetter) {
    authToken = await fetchAuthToken();
  }
  return authToken;
}

export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  function makeClient() {
    const middleware = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        return response;
      });
    });

    const authLink = new ApolloLink((operation, forward) => {
        const sessionToken = localStorage.getItem("sessionToken");
        const refreshToken = localStorage.getItem("refreshToken");
      
        console.log("Session token:", sessionToken);
        console.log("Refresh token:", refreshToken);
      
        // Set the "woocommerce-session" header in all cases
        operation.setContext({
          headers: {
            "woocommerce-session": `Session ${sessionToken}`,
          },
        });
      
        // Call the async function to handle refreshToken and Authorization header
        async function handleRefreshToken() {
          if (refreshToken) {
            try {
              const token = await getAuthToken();
              console.log("New token:", token);
              operation.setContext((context: any) => ({
                headers: {
                  ...context.headers,
                  Authorization: `Bearer ${token}`,
                },
              }));
            } catch (err) {
              console.error("Error setting Authorization header:", err);
            }
          }
        }
      
        // Call the async function to handle refreshToken
        handleRefreshToken();
      
        return forward(operation);
      });
      

    const httpLink = new HttpLink({
      // This needs to be an absolute URL, as relative URLs cannot be used in SSR
      uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
      fetchOptions: {
        cache: "no-store",
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
      link: middleware.concat(
        authLink.concat(
          typeof window === "undefined"
            ? ApolloLink.from([
                // In an SSR environment, if you use multipart features like
                // @defer, you need to decide how to handle these.
                // This strips all interfaces with a `@defer` directive from your queries.
                new SSRMultipartLink({
                  stripDefer: true,
                }),
                httpLink,
              ])
            : httpLink
        )
      ),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "no-cache",
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
