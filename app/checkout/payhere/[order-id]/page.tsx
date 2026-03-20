"use client";
import ProductTable, { OrderDetails, PaymentSection } from "./Comps";
import { toast } from "sonner";
import Link from "next/link";
import Script from "next/script";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { PaymentDetailsWithoutUrls } from "@/data/types";
import {
  GET_CHECKOUT_USER_DETAILS,
  GET_SINGLE_ORDER,
} from "@/graphql/defs/order";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useEffect, useMemo, use } from "react";
import OrderPaymentPageSkeleton from "./Skeleton";

// Order Status Message Component
const OrderStatusMessage = ({ status }: { status: string }) => {
  if (status === "pending" || status === "processing") {
    return (
      <div className="mb-8 rounded-lg bg-blue-50 p-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-blue-800">
          Thank You! Order Received
        </h2>
        <p className="text-blue-600">
          Please complete your payment to process the order.
        </p>
      </div>
    );
  }

  if (status === "completed" || status === "success") {
    return (
      <div className="mb-8 rounded-lg bg-green-50 p-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-green-800">
          Payment Successful!
        </h2>
        <p className="text-green-600">
          Thank you for your purchase. Your order has been successfully
          processed.
        </p>
      </div>
    );
  }

  if (status == "phauthorized") {
    return (
      <div className="mb-8 rounded-lg bg-blue-50 p-6 text-center">
        <p className="text-blue-600">
          Your order has been Paid and Authorized. Our team will review this and
          proceed order
        </p>
      </div>
    );
  }

  return null;
};

// Main Payment Page Component
export default function PayherePaymentPage(props: { params: Promise<{ "order-id": string }> }) {
  const params = use(props.params);
  const orderId = params["order-id"];
  if (!orderId) {
    toast.error(
      `Order not found: ${orderId}. or This page is not accessible for you.`
    );
  }

  const [getUserData, { data: customerData }] = useLazyQuery(
    GET_CHECKOUT_USER_DETAILS,
    { fetchPolicy: "no-cache" }
  );

  const { getCart, clearCart } = useCart();

  const refreshCart = async () => {
    try {
      await getCart();
    } catch (error: any) {
      console.error("Error refreshing the cart:", error);
      throw error;
    }
  };

  const { data: orderData, error: orderError } = useQuery(GET_SINGLE_ORDER, {
    variables: { orderID: orderId },
  });

  useEffect(() => {
    getUserData();
    const clearCartSafely = async () => {
      try {
        await clearCart();
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

  const temporaryPaymentDetails: PaymentDetailsWithoutUrls = useMemo(
    () => ({
      order_id: orderData?.order?.orderNumber ?? "",
      items: orderData?.order?.lineItems?.nodes ?? [],
      subtotal: orderData?.order?.subtotal,
      amount: orderData?.order?.total ?? "",
      currency: "LKR",
      first_name:
        customerData?.customer?.shipping?.firstName ?? "no_first_name",
      last_name: customerData?.customer?.shipping?.lastName ?? "no_last_name",
      email: customerData?.customer?.email ?? "no_email",
      phone: customerData?.customer?.shipping?.phone ?? "no_phone",
      shippingAddress1:
        customerData?.customer?.shipping?.address1 ?? "no_shipping_address1",
      shippingAddress2:
        customerData?.customer?.shipping?.address2 ?? "no_shipping_address2",
      billingAddress1:
        customerData?.customer?.billing?.address1 ?? "no_billing_address1",
      billingAddress2:
        customerData?.customer?.billing?.address2 ?? "no_billing_address2",
      city: customerData?.customer?.shipping?.city ?? "no_city",
      country: "Sri Lanka",
      shippingTotal: orderData?.order?.shippingTotal ?? "N/A",
      total: orderData?.order?.total ?? "N/A",
    }),
    [orderData, customerData]
  );

  if (!orderData) {
    return <OrderPaymentPageSkeleton />;
  }

  if (orderError) {
  }
  const orderStatus = orderData?.order?.status?.toLowerCase() ?? "pending";

  let parsedOrderData = orderData?.order;
  let email = customerData?.customer?.email;
  return (
    <>
      <Script
        type="text/javascript"
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onLoad={() => {
          // PayHere script loaded successfully
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

          {/* Email Notification */}
          <div className="mb-6 text-gray-600">
            Order details will be sent to your email:{" "}
            <span className="font-medium">{email}</span>
          </div>

          {/* Payment Section - Only show for pending/processing orders */}
          {(orderStatus === "pending" || orderStatus === "processing") && (
            <PaymentSection
              orderData={temporaryPaymentDetails}
              CoreOrderData={orderData}
            />
          )}

          {/* Order Details */}
          <OrderDetails
            orderData={temporaryPaymentDetails}
            orderStatus={orderStatus}
          />

          {/* Product Table */}
          <div className="">
            <div className="">
              <ProductTable
                lineItems={temporaryPaymentDetails?.items}
                orderData={temporaryPaymentDetails}
              />
            </div>
          </div>
        </div>

        <h1 className="pb-4 pt-20 text-center text-2xl font-bold">
          To Explore Our Product Range Further!
        </h1>
        <Link href="/">
          <ButtonPrimary>Shop More</ButtonPrimary>
        </Link>
      </div>
    </>
  );
}
