"use client";

import {ApolloLink, defaultDataIdFromObject, HttpLink} from "@apollo/client";
import {
    ApolloNextAppProvider,
    NextSSRInMemoryCache,
    NextSSRApolloClient,
    SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import {useSession} from "@/context/SessionProvider";
import {setContext} from "@apollo/client/link/context";

export default function ApolloWrapper ({ children }: React.PropsWithChildren)  {

    function makeClient() {

        const middleware = new ApolloLink((operation, forward) => {

            return forward(operation).map(response => {
                return response;
            });
        })

        const authLink = new ApolloLink((operation, forward) => {

            const sessionToken = localStorage.getItem('sessionToken');
            const authToken = localStorage.getItem('authToken');

                operation.setContext({
                    headers: {
                        'woocommerce-session' : `Session ${sessionToken}`, // Set the sessionToken as an Authorization header
                        'authorization' : `Bearer ${authToken}`, // Set the sessionToken as an Authorization header
                    },
                });

            return forward(operation);
        });

        const httpLink = new HttpLink({
            // this needs to be an absolute url, as relative urls cannot be used in SSR
            uri: process.env.NEXT_PUBLIC_WP_GRAPHQL,
            fetchOptions: {
                cache: 'no-store'
            }
            // you can disable result caching here if you want to
            // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
            // fetchOptions: { cache: "no-store" },
            // you can override the default `fetchOptions` on a per query basis
            // via the `context` property on the options passed as a second argument
            // to an Apollo Client data fetching hook, e.g.:
            // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
        });

        return new NextSSRApolloClient({
            // use the `NextSSRInMemoryCache`, not the normal `InMemoryCache`
            connectToDevTools: true,
            cache: new NextSSRInMemoryCache(),
            link: middleware.concat(authLink.concat( typeof window === "undefined"
                ? ApolloLink.from([
                    // in a SSR environment, if you use multipart features like
                    // @defer, you need to decide how to handle these.
                    // This strips all interfaces with a `@defer` directive from your queries.
                    new SSRMultipartLink({
                        stripDefer: true,
                    }),
                    httpLink,
                ])
                : httpLink))
            ,
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'no-cache'
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