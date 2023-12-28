"use client";

import {
  ApolloLink,
  DefaultContext,
  defaultDataIdFromObject,
  FetchResult, from,
  HttpLink,
  useMutation,
} from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { GraphQLClient } from 'graphql-request';

import { gql } from "@apollo/client";
import { GET_AUTH_TOKEN } from "./defs/auth";
import { getClient } from "./apollo-ssr";
import { getSessionToken } from "./session-handler";


// export async function getSessionToken(forceFetch = false) {
//   let sessionToken = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string);
//   if (!sessionToken || forceFetch) {
//     sessionToken = await fetchSessionToken();
//   }
//   return sessionToken;
// }


export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  function makeClient() {
    const middleware = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        return response;
      });
    });



    function hasCredentials() {
      const authToken = localStorage.getItem(process.env.AUTH_TOKEN_SS_KEY ?? "");
      const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY ?? "");


      if (!!authToken && !!refreshToken) {
        return true;
      }

      return false;
    }

    async function refreshAuthToken(refreshToken: string) {
      try {
        const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_WP_GRAPHQL || "");

        const results = await graphQLClient.request(GET_AUTH_TOKEN, { refreshToken }) as Results;
        // const results: any = await refresh({
        //   variables: {
        //     refreshToken,
        //   },
        // });

        const authToken = results?.refreshJwtAuthToken?.authToken;


        if (!authToken) {
          throw new Error("Failed to retrieve a new auth token");
        }
        return authToken;
      } catch (err) {
        console.error("Error refreshing auth token:", err);
        throw err;
      }
    }
    let tokenSetter: any;

    async function fetchAuthToken() {
      const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY || "");
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
        localStorage.setItem(process.env.AUTH_TOKEN_SS_KEY || "", authToken);
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

    async function getAuthToken() {
      let authToken = localStorage.getItem(process.env.AUTH_TOKEN_SS_KEY ?? "");


      if (!authToken || !tokenSetter) {

        authToken = await fetchAuthToken() ?? "no auth token";
      }

      return authToken;
    }

    const authLink = new ApolloLink((operation, forward) => {
      operation.setContext(async ({ context }: DefaultContext) => {
        const { headers: currentHeaders = {} } = context || {}; // Destructure context and set default headers object
        const headers = { ...currentHeaders };
        const sessionToken = await getSessionToken();
        const authToken = await getAuthToken();

        const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY || "");
        const localAuthToken = localStorage.getItem(process.env.AUTH_TOKEN_SS_KEY || "");

        if (refreshToken) {
          if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
          }
        }


        if (sessionToken) {
          headers['woocommerce-session'] = `Session ${sessionToken}`;
        }


        if (authToken || sessionToken) {
          return { headers };
        }

        return {};
      });

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
      link: from([
        authLink,
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
      ]),

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
