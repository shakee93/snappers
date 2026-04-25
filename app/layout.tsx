import "../styles/index.scss";
import "./index.css";
import "rc-slider/assets/index.css";
import ApolloWrapper from "@/graphql/apollo-client";
import { SessionProvider } from "@/context/SessionProvider";
import { CartProvider } from "@/context/CartProvider";
import { PaymentProvider } from "@/context/PaymentProvider";
import Header from "@/app/components/globalComponents/header";
import HeaderGate from "@/app/components/globalComponents/HeaderGate";
import { Toaster } from "sonner";
import Footer from "@/app/components/globalComponents/footer";
import { Suspense } from "react";
import { NavigationEvents } from "@/app/components/NavigationEvents";
import { Metadata } from "next";
import WhatsappLogoComponent from "@/app/components/WhatsAppLogo";
import Script from "next/script";
import ScreenSizeIndicator from "@/app/components/ScreenSizeIndicator";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import AttributeMappingsInitializer from "@/app/components/AttributeMappingsInitializer";
import ContentWrapper from "@/app/components/ContentWrapper";

export const metadata: Metadata = {
  title: {
    template: "%s - GQ Mobiles",
    default: "GQ Mobiles - Best mobile phones in the market",
  },
  description: "Shop the best mobile phones, smartwatches, and accessories at GQ Mobiles. Find the latest tech from top brands.",
  openGraph: {
    title: "GQ Mobiles - Best mobile phones in the market",
    description: "Shop the best mobile phones, smartwatches, and accessories at GQ Mobiles. Find the latest tech from top brands.",
    url: "https://gqmobiles.lk",
    siteName: "GQ Mobiles",
    images: [
      {
        url: "https://cdn.gqmobiles.lk/wp-content/uploads/2025/10/gq.png",
        width: 1200,
        height: 630,
        alt: "GQ Mobiles Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GQ Mobiles - Best mobile phones in the market",
    description: "Shop the best mobile phones, smartwatches, and accessories at GQ Mobiles. Find the latest tech from top brands.",
    images: ["/global/gq-logo.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Server-side localhost check
  const isLocalhost = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="1jxvcjKwBJHZpD2gN7mtEpCc1WQfzu7Wfp0RlyA0zA4"
        />
        {/* Google Analytics - Only load in production */}
        {!isLocalhost && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-LS3EVR93ZH"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-LS3EVR93ZH', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
        {/* <Script
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
        /> */}

        {/* New hotjar script on october 15 */}

        <Script
          id="hotjar-script-gq-mobile"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:5171595,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-gray-100 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200"
      >
        <ApolloWrapper>
          <CartProvider>
            <SessionProvider>
              <Suspense fallback={null}>
                <NavigationEvents />
              </Suspense>
              <Suspense fallback={null}>
                <GoogleAnalytics />
              </Suspense>

              <HeaderGate>
                <Header />
              </HeaderGate>
              <ContentWrapper>{children}</ContentWrapper>
              <WhatsappLogoComponent />
              <Toaster />
              <HeaderGate>
                <Footer />
              </HeaderGate>
              {/* <ScreenSizeIndicator /> */}
            </SessionProvider>
          </CartProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
