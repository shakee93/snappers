import "../styles/index.scss";
import "./index.css";
import "../fonts/line-awesome-1.3.0/css/line-awesome.css";
import "rc-slider/assets/index.css";
import ApolloWrapper from "@/graphql/apollo-client";
import { SessionProvider } from "@/context/SessionProvider";
import { CartProvider } from "@/context/CartProvider";
import Header from "@/app/components/globalComponents/header";
import { Toaster, toast } from "sonner";
import Footer from "@/app/components/globalComponents/footer";
import { Suspense } from "react";
import { NavigationEvents } from "@/app/components/NavigationEvents";
import { Metadata } from "next";
import WhatsappLogoComponent from "@/app/components/WhatsAppLogo";

export const metadata: Metadata = {
  title: {
    template: "%s - GQ Mobiles",
    default: "GQ Mobiles - Best mobile phones in the market", // a default is required when creating a template
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
  console.log("isLocalhost", JSON.stringify(isLocalhost, null, 2));

  return (
    <html lang="en">
      <head>
        {!isLocalhost && (
          <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-LS3EVR93ZH"
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-LS3EVR93ZH');
                `,
              }}
            />
          </>
        )}
      </head>

      <body className="bg-gray-50 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        <ApolloWrapper>
          <CartProvider>
            <SessionProvider>
              <Suspense fallback={null}>
                <NavigationEvents></NavigationEvents>
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
