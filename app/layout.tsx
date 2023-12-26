// import Footer from '@/app/components/GlobalComponents/Footer'

import "../styles/index.scss";
// import './globals.css'
import "./index.css";
import "../fonts/line-awesome-1.3.0/css/line-awesome.css";
import "rc-slider/assets/index.css";
import ApolloWrapper from "@/graphql/apollo-client";
import {SessionProvider} from "@/context/SessionProvider";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import {CartProvider} from "@/context/CartProvider";
import Header from "@/app/components/globalComponents/header";
import {Toaster} from "react-hot-toast";
import Footer from "@/app/components/globalComponents/footer";
import {SearchProvider} from "@/context/SearchProvider";
import { getClient } from "@/graphql/apollo-ssr";
import { gql } from "@apollo/client";
import {Loader} from "lucide-react";
// import reportWebVitals from "./reportWebVitals";

// const inter = Inter({ subsets: ['latin'] })

export const GET_ACCOUNT_DETAILS = gql`
  query getAccountDetails{
  customer {
    email
    displayName
    billing {
      address1
      phone
      email
    }
    metaData(multiple: true) {
      key
      value
      id
    }
    username
    id
  }
}
`;
export default async  function RootLayout({children}: {
    children: React.ReactNode
}) {

    const { data: accountDetailsData, error: accountDetailsError } = await getClient().query({
        query: GET_ACCOUNT_DETAILS
    });

    if (accountDetailsError) {
        console.error("Error fetching account details:", accountDetailsError);
    }

    // Log the fetched data
    console.log("Account Details Data:", accountDetailsData);

    return (
        <html lang="en">
        <body className="bg-gray-50 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        <ApolloWrapper>
            <SessionProvider>
                <>
                    <CartProvider>
                        <Toaster/>

                        <Header/>
                        {children}
                        <div className="md:hidden">
                            <MobileBottomNav/>
                        </div>
                        <Footer/>
                    </CartProvider>
                </>
            </SessionProvider>
        </ApolloWrapper>
        </body>
        </html>
    )
};
