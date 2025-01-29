"use client";
import ProductTable, { OrderDetails, PaymentSection } from "./Comps";
import { toast } from "sonner";
import Link from "next/link";
import Script from "next/script";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useSearchParams } from "next/navigation";



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

// Main Payment Page Component
export default function PayherePaymentPage() {
  const searchParams = useSearchParams();

  let orderData = localStorage.getItem('payhere_last_order');
  const parsedOrderData = orderData ? JSON.parse(orderData) : {};
  const orderStatus = (parsedOrderData?.order as any)?.status || "pending";

  const orderId = parsedOrderData?.checkout?.order?.databaseId;

  if (orderId === "guest_checkout") {
    return (
      <h1 className="py-20 text-center text-2xl font-bold">
        📝 The page is unable to load
      </h1>
    );
  }

  if (orderId === "ItemNo12345") {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          📝 The page is unable to load the order ID since it{"'"}s a Payhere
          testing ID.
        </h1>
        <Link href="/" passHref>
          <div className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </div>
        </Link>
      </div>
    );
  }

  if (!orderId || orderId === "12345") {
    toast.error(`Order not found: ${orderId}`);
  }

  if (orderId === "guest_checkout" && searchParams) {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="pt-20 text-center text-2xl font-bold">
          Thank you! Your order has been successfully placed📦
        </h1>
        <p className="py-4 text-center">
          Please check your email({searchParams}) for further details.
        </p>
        <Link href="/" passHref>
          <p className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </p>
        </Link>
      </div>
    );
  }

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
