/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ProductTable, { OrderDetails, PaymentSection } from "./Comps";
import { toast } from "sonner";
import Link from "next/link";
import Script from "next/script";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { useEffect, useState } from "react";
import OrderPaymentPageSkeleton from "./Skeleton";
import { siteConfig } from "@/site.config";

// No Order Message Component
const NoOrderMessage = () => {
  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">

        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Order Not Available 
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn{"'"}t find your payhere order information. If you believe this is our mistake, please contact us:
        </p>
        <div className="space-y-2 text-lg">
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            <a href={`tel:${siteConfig.contact.primaryPhone}`} className="text-blue-600 hover:underline">{siteConfig.contact.primaryPhone}</a>
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-blue-600 hover:underline">
              {siteConfig.contact.email}
            </a>
          </p>
        </div>
        <div className="mt-8">
          <Link href="/">
            <ButtonPrimary>Return to Home</ButtonPrimary>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main Payment Page Component
export default function PayherePaymentPage() {
  const { clearCart, refreshCart } = useCart();
  const [orderData, setOrderData] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Access localStorage only on client side
    const storedOrderData = localStorage.getItem('payhere_last_order');
    setOrderData(storedOrderData);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    const clearCartSafely = async () => {
      try {
        await clearCart();
        await refreshCart();
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          !error.message.includes("No items in cart to remove")
        ) {
          console.error("Error clearing cart:", error);
        }
      }
    };
    void clearCartSafely();
  }, []);

  // Show skeleton while checking localStorage
  if (isChecking) {
    return <OrderPaymentPageSkeleton />;
  }

  // Return early if no order data
  if (!orderData) {
    return <NoOrderMessage />;
  }

  const parsedOrderData = JSON.parse(orderData);
  let email = parsedOrderData?.checkout?.customer?.billing?.email || "";
  
  const orderStatus = (parsedOrderData?.order as any)?.status || "pending";

  // const orderId = parsedOrderData?.checkout?.order?.databaseId;

  return (
    <>
      <Script
        type="text/javascript"
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onLoad={() => {
          // console.log("PayHere script loaded");
        }}
        onError={() => {
          console.error("Error loading PayHere script");
          toast.error("Failed to load payment system");
        }}
      />

      <div className="container mx-auto rounded-3xl text-center lg:p-20">
        <div className="my-4">
          {/* Order Status Message */}
          {/* <OrderStatusMessage status={orderStatus} email={email} /> */}
          
          {/* Payment Section - Moved to top */}
          <PaymentSection
            orderData={parsedOrderData.checkout}
            email={email}
          />

          {/* Order Details */}
          <OrderDetails orderData={parsedOrderData.checkout} />
          
          {/* Product Table */}
          <div className="">
            <div className="">
              <ProductTable
                lineItems={parsedOrderData?.checkout?.order?.lineItems?.nodes}
                orderData={parsedOrderData?.checkout}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center pb-16 pt-20 text-center">
          <h2 className="text-2xl font-bold text-header-green">
            To Explore Our Product Range Further!
          </h2>
          <Link href="/shop" className="mt-5">
            <ButtonPrimary sizeClass="px-10 py-3.5 sm:px-12 sm:py-4">
              Shop More
            </ButtonPrimary>
          </Link>
        </div>
      </div>
    </>
  );
}
