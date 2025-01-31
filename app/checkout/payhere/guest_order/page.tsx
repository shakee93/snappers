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



// Order Status Message Component
// const OrderStatusMessage = ({ status, email }: { status: string, email: string }) => {
//   if (status === "pending") {
//     return (
//       <div className="mb-8 space-y-6">
   
        
//         {/* Payment pending warning */}
//         <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//             </div>
//             <div className="ml-1">
//               <h3 className="text-lg text-left font-medium text-yellow-800">Payment Required</h3>
//               <p className="mt-1 ml-1 text-left text-yellow-700">
//                 Please complete your payment to process and confirm your order.
//               </p>
//               <p className="mt-1 ml-1 text-left text-yellow-700">
//                 Your order details have been sent to your email address: {email}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* PayHere Payment Banner */}
//         <div className="rounded-lg bg-white p-6 shadow-sm">
//           <h3 className="mb-4 text-lg font-semibold text-gray-800">Secure Payment Powered By</h3>
//           <div className="flex justify-center">
//               <img 
//                 src="https://www.payhere.lk/downloads/images/payhere_square_banner_dark.png" 
//                 alt="PayHere" 
//                 className="h-auto w-[200px]"
//               />
//           </div>
//           <p className="mt-4 text-sm text-gray-600 text-center">
//             We accept Visa, Mastercard, and local payment methods through PayHere
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (status === "completed") {
//     return (
//       <div className="mb-8 space-y-6">
//         <h2 className="mb-2 text-2xl font-bold text-blue-800">Thank You for Your Order!</h2>
//         <p className="text-blue-700">Your order has been successfully received.</p>
//         <p className="text-blue-700">Your order details have been sent to your email address: {email}</p>
//       </div>
//     );
//   }
//   return null;
// };

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
  const [orderData, setOrderData] = useState<string | null>(null);

  useEffect(() => {
    // Access localStorage only on client side
    const storedOrderData = localStorage.getItem('payhere_last_order');
    setOrderData(storedOrderData);
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
