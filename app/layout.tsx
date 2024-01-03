// import Footer from '@/app/components/GlobalComponents/Footer'

import "../styles/index.scss";
import { Providers } from "./providers";
import "./index.css";
import "../fonts/line-awesome-1.3.0/css/line-awesome.css";
import "rc-slider/assets/index.css";
import ApolloWrapper from "@/graphql/apollo-client";
import { SessionProvider } from "@/context/SessionProvider";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import { CartProvider } from "@/context/CartProvider";
import Header from "@/app/components/globalComponents/header";
import { Toaster } from "react-hot-toast";
import Footer from "@/app/components/globalComponents/footer";
import { SearchProvider } from "@/context/SearchProvider";
import { Loader } from "lucide-react";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";

// import reportWebVitals from "./reportWebVitals";

// const inter = Inter({ subsets: ['latin'] })

async function getData(categories: number[] | null = null) {
  const { data, error } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  return {
    productCategories: data.productCategories.nodes,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { productCategories } = await getData();
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-gray-50 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        <ApolloWrapper>
          <SessionProvider>
            <>
              <CartProvider>
                <Toaster />

                <Header />
                {children}
                <div className="md:hidden">
                  <MobileBottomNav categories={productCategories} />
                </div>
                <Footer />
              </CartProvider>
            </>
          </SessionProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
