import "../styles/index.scss";
import "./index.css";
import "../fonts/line-awesome-1.3.0/css/line-awesome.css";
import "rc-slider/assets/index.css";
import ApolloWrapper from "@/graphql/apollo-client";
import {SessionProvider} from "@/context/SessionProvider";
import {CartProvider} from "@/context/CartProvider";
import Header from "@/app/components/globalComponents/header";
import {Toaster} from "react-hot-toast";
import Footer from "@/app/components/globalComponents/footer";
import {Suspense} from "react";
import {NavigationEvents} from "@/app/components/NavigationEvents";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: {
        template: '%s - GQ Mobiles',
        default: 'GQ Mobiles - Best mobile phones in the market', // a default is required when creating a template
    },
    description: ""
}

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <head>
            <meta name="robots" content="noindex, nofollow"/>
        </head>
        <body className="bg-gray-50 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        <ApolloWrapper>
            <SessionProvider>
                <>
                    <CartProvider>
                        <Suspense fallback={null}>
                            <NavigationEvents></NavigationEvents>
                        </Suspense>
                        <Toaster/>
                        <Header/>
                        {children}

                        <Footer/>
                    </CartProvider>
                </>
            </SessionProvider>
        </ApolloWrapper>
        </body>
        </html>
    );
}
