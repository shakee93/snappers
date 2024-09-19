import "../styles/index.scss";
import "./index.css";
import "../fonts/line-awesome-1.3.0/css/line-awesome.css";
import "rc-slider/assets/index.css";
import ApolloWrapper from "@/graphql/apollo-client";
import { SessionProvider } from "@/context/SessionProvider";
import { CartProvider } from "@/context/CartProvider";
import Header from "@/app/components/globalComponents/header";
import { Toaster } from "sonner";
import Footer from "@/app/components/globalComponents/footer";
import { Suspense } from "react";
import { NavigationEvents } from "@/app/components/NavigationEvents";
import { Metadata } from "next";
import WhatsappLogoComponent from "@/app/components/WhatsAppLogo";
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    template: "%s - GQ Mobiles",
    default: "GQ Mobiles - Best mobile phones in the market",
  },
  description: "",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLocalhost =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  return (
    <html lang="en">
      <head>
        {!isLocalhost && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-LS3EVR93ZH"
            />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-LS3EVR93ZH');
              `}
            </Script>
          </>
        )}
        <Script
          id="hotjar-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:5136219,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      </head>
      <body className="bg-gray-100 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        <ApolloWrapper>
          <CartProvider>
            <SessionProvider>
              <Suspense fallback={null}>
                <NavigationEvents />
              </Suspense>
              <Header />
              <div className="pb-8 md:pb-24">{children}</div>
              <WhatsappLogoComponent />
              <Toaster />
              <Footer />
            </SessionProvider>
          </CartProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}