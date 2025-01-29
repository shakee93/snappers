/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ProductTable, { OrderDetails, PaymentSection } from "./Comps";
import { toast } from "sonner";
import Link from "next/link";
import Script from "next/script";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { useEffect } from "react";



// Order Status Message Component
const OrderStatusMessage = ({ status }: { status: string }) => {
  if (status === "pending") {
    return (
      <div className="mb-8 rounded-lg bg-blue-50 p-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-blue-800">Thank You! Order Received</h2>
        <p className="text-blue-600">Please complete your payment to process the order.</p>
      </div>
    );
  }
  return null;
};

// No Order Message Component
const NoOrderMessage = () => {
  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Order Not Available
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn{"'"}t find your order information. If you believe this is our mistake, please contact us:
        </p>
        <div className="space-y-2 text-lg">
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            <a href="tel:0777555665" className="text-blue-600 hover:underline">077 755 5665</a>
            {" / "}
            <a href="tel:0777988665" className="text-blue-600 hover:underline">077 798 8665</a>
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <a href="mailto:inquiries@gqmobiles.lk" className="text-blue-600 hover:underline">
              inquiries@gqmobiles.lk
            </a>
          </p>
        </div>
        <div className="mt-8">
          <Link href="/" passHref>
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

  let orderData = localStorage.getItem('payhere_last_order');
  
  useEffect(() => {
    const clearCartSafely = async () => {
      try {
        await clearCart();
        await refreshCart();
      } catch (error: unknown) {
        // Ignore "No items in cart to remove" error as it's expected
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

  // Return early if no order data
  if (!orderData) {
    return <NoOrderMessage />;
  }

  const parsedOrderData = JSON.parse(orderData);
  const orderStatus = (parsedOrderData?.order as any)?.status || "pending";

  // const orderId = parsedOrderData?.checkout?.order?.databaseId;

  return (
    <>
      <Script
        type="text/javascript"
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("PayHere script loaded");
        }}
        onError={() => {
          console.error("Error loading PayHere script");
          toast.error("Failed to load payment system");
        }}
      />

      <div className="container mx-auto rounded-3xl text-center lg:p-20">
        <div className="my-4">
          {/* Order Status Message */}
          <OrderStatusMessage status={orderStatus} />
          
          {/* Payment Section - Moved to top */}
          <PaymentSection
            orderData={parsedOrderData.checkout}
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

        <h1 className="pb-4 pt-20 text-center text-2xl font-bold">
          To Explore Our Product Range Further!
        </h1>
        <Link href="/" passHref>
          <ButtonPrimary>Shop More</ButtonPrimary>
        </Link>
      </div>
    </>
  );
}
