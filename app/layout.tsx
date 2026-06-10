import "../styles/index.scss";
import "./index.css";
import "rc-slider/assets/index.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import ApolloWrapper from "@/graphql/apollo-client";
import { SessionProvider } from "@/context/SessionProvider";
import { CartProvider } from "@/context/CartProvider";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { NavigationEvents } from "@/components/global/layout/NavigationEvents";
import { Metadata } from "next";
import WhatsappLogoComponent from "@/components/global/layout/WhatsAppLogo";
import Script from "next/script";
import GoogleAnalytics from "@/components/global/layout/GoogleAnalytics";
import ContentWrapper from "@/components/global/layout/ContentWrapper";
import { siteConfig } from "@/site.config";
import { getSiteMetadataIcons, getSiteTwitterImage } from "@/lib/siteAssets";
import SiteThemeStyles from "@/components/global/theme/SiteThemeStyles";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const albraSans = localFont({
  src: "../fonts/Albra Sans Semi-Traced-Web.ttf",
  variable: "--font-albra",
  weight: "600",
  display: "swap",
});

const defaultTitle = `${siteConfig.brand.name} - ${siteConfig.brand.tagline}`;

export const metadata: Metadata = {
  title: {
    template: `%s - ${siteConfig.brand.name}`,
    default: defaultTitle,
  },
  description: siteConfig.brand.description,
  icons: getSiteMetadataIcons(),
  openGraph: {
    title: defaultTitle,
    description: siteConfig.brand.description,
    url: siteConfig.url.base,
    siteName: siteConfig.brand.name,
    images: [
      {
        url: siteConfig.url.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brand.name} Logo`,
      },
    ],
    locale: siteConfig.locale.ogLocale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.brand.description,
    images: [getSiteTwitterImage()],
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
    <html lang="en" className={`${inter.variable} ${albraSans.variable}`}>
      <head>
        <SiteThemeStyles />
        <meta
          name="google-site-verification"
          content="1jxvcjKwBJHZpD2gN7mtEpCc1WQfzu7Wfp0RlyA0zA4"
        />
        {/* Google Analytics - Only load in production */}
        {!isLocalhost && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteConfig.analytics.googleAnalyticsId}', {
                  send_page_view: false,
                });
              `}
            </Script>
          </>
        )}
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
        className="bg-white text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200"
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

              <ContentWrapper>{children}</ContentWrapper>
              <WhatsappLogoComponent />
              <Toaster />
            </SessionProvider>
          </CartProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
