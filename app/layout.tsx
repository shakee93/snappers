"use client";

// import Footer from '@/app/components/GlobalComponents/Footer'

import "../styles/index.scss";
// import './globals.css'
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
// import reportWebVitals from "./reportWebVitals";

// const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <ApolloWrapper>
                <SessionProvider>
                    <CartProvider>
                        <Toaster />
                        <body className="bg-gray-50 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                            <Header />

                            {children}

                    <div className="md:hidden">
                        <MobileBottomNav/>
                    </div>
                    <Footer/>
                    </body>
                </CartProvider>
            </SessionProvider>
        </ApolloWrapper>
        </html>
    )
}
