/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { OrderPaymentPageProps, PaymentDetailsWithoutUrls } from "@/data/types";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CHECKOUT_USER_DETAILS,
  GET_SINGLE_ORDER,
} from "@/graphql/defs/order";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductTable, { OrderDetails } from "./Comps";
import { toast } from "sonner";
import Link from "next/link";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartProvider";

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const router = useRouter();
  const orderId = params["order-id"];
  const searchParams = useSearchParams().get("email");

  // All hooks must be called at the top level, before any conditional returns
  const { getCart, clearCart, refreshCart } = useCart();
  const [getUserData, { data: customerData }] = useLazyQuery(
    GET_CHECKOUT_USER_DETAILS,
    { fetchPolicy: "no-cache" },
  );

  const order_id = useSearchParams().get('order_id');
  const first_name = useSearchParams().get('first_name');
  const last_name = useSearchParams().get('last_name');
  const email = useSearchParams().get('email');
  const address = useSearchParams().get('address');
  const amount = useSearchParams().get('amount');
  const items = useSearchParams().get('items');
  const shippingTotal = useSearchParams().get('shippingTotal');
  const subtotal = useSearchParams().get('subtotal');
  const date = useSearchParams().get('date');
  const shippingaddress1 = useSearchParams().get('shippingaddress1');
  const shippingaddress2 = useSearchParams().get('shippingaddress2');
  const billingaddress1 = useSearchParams().get('billingaddress1');
  const billingaddress2 = useSearchParams().get('billingaddress2');
  const city = useSearchParams().get('city');
  const lineItemsParam = useSearchParams().get('lineItems');
  const lineItems = lineItemsParam && lineItemsParam !== "undefined"
    ? JSON.parse(lineItemsParam)
    : { nodes: [] };
  const ordermethod = useSearchParams().get('ordermethod');

  //Koko Payment
  const trnId = useSearchParams().get('trnId');
  const orderIdParam = useSearchParams().get('orderId') || (typeof window !== 'undefined' ? window.location.pathname.split('/')[2] || '' : '');
  const orderIdUrl = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';
  const status = useSearchParams().get('status');
  const desc = useSearchParams().get('desc');
  const key = useSearchParams().get('key');
  const wcApi = useSearchParams().get('wc-api');

  
  const hasClearedGuestRef = useRef(false);
  const hasClearedSimpleRef = useRef(false);
  const hasClearedOrderRef = useRef(false);
  
  // State for localStorage order data (for guest NDB Pay orders)
  const [localStorageOrderData, setLocalStorageOrderData] = useState<any>(null);
  const [isCheckingLocalStorage, setIsCheckingLocalStorage] = useState(true);

  // Check localStorage for guest order data (similar to PayHere guest orders)
  useEffect(() => {
    if (typeof window !== 'undefined' && orderId) {
      try {
        const lastOrder = localStorage.getItem('last_order');
        if (lastOrder) {
          const parsedOrder = JSON.parse(lastOrder);
          // Check if the order ID matches and it's likely a guest order
          const storedOrderId = parsedOrder?.checkout?.order?.databaseId?.toString();
          if (storedOrderId === orderId) {
            setLocalStorageOrderData(parsedOrder);
          }
        }
      } catch (error) {
        console.error('Error reading localStorage order data:', error);
      } finally {
        setIsCheckingLocalStorage(false);
      }
    } else {
      setIsCheckingLocalStorage(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastOrder = localStorage.getItem('last_order');
      if (lastOrder && trnId && status !== "FAILURE") {
        router.push(`/checkout/koko/guest_order?orderId=${orderIdUrl}&status=${status}`);
      }
    }
  }, [trnId, status, orderIdUrl, router]);

  useEffect(() => {
    const sendKokoVerification = async () => {
      if (orderIdUrl && status) {
        try {
          const response = await fetch('/api/koko-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderIdUrl,
              status: status,
            }),
          });

          const data = await response.json();
        } catch (error) {
          console.error('Error sending Koko verification:', error);
        }
      }
    };

    sendKokoVerification();
  }, [orderId, status, orderIdUrl]); // Dependencies to trigger the effect

  // Query for order data (will be skipped for guest checkouts or if we have localStorage data)
  const { data: orderData, error: orderError } = useQuery(GET_SINGLE_ORDER, {
    variables: { orderID: orderId },
    skip: !orderId || orderId === "guest_checkout" || orderId === "ItemNo12345" || orderId === "12345" || ordermethod === "guest" || !!localStorageOrderData,
  });

  // Clear cart for guest checkout with ordermethod=guest
  useEffect(() => {
    if (ordermethod === "guest" && !hasClearedGuestRef.current) {
      hasClearedGuestRef.current = true;
      const clearCartSafely = async () => {
        try {
          await clearCart();
          await refreshCart();
        } catch (error: unknown) {
          // Silently handle errors - cart might already be cleared or session invalid
          if (
            error instanceof Error &&
            !error.message.includes("No items in cart to remove") &&
            !error.message.includes("500")
          ) {
            console.error("Error clearing cart:", error);
          }
        }
      };
      void clearCartSafely();
    }
  }, [ordermethod, clearCart, refreshCart]);

  // Clear cart for simple guest checkout completion
  useEffect(() => {
    if (orderId === "guest_checkout" && searchParams && !hasClearedSimpleRef.current) {
      hasClearedSimpleRef.current = true;
      const clearCartSafely = async () => {
        try {
          await clearCart();
          await refreshCart();
        } catch (error: unknown) {
          // Silently handle errors - cart might already be cleared or session invalid
          if (
            error instanceof Error &&
            !error.message.includes("No items in cart to remove") &&
            !error.message.includes("500")
          ) {
            console.error("Error clearing cart:", error);
          }
        }
      };
      void clearCartSafely();
    }
  }, [orderId, searchParams, clearCart, refreshCart]);

  // Clear cart for regular order completion (non-guest) or NDB Pay guest orders
  useEffect(() => {
    // For NDB Pay guest orders (using localStorage data)
    if (localStorageOrderData && !hasClearedOrderRef.current) {
      hasClearedOrderRef.current = true;
      const clearCartSafely = async () => {
        try {
          await clearCart();
          await refreshCart();
        } catch (error: unknown) {
          // Silently handle errors - cart might already be cleared or session invalid
          if (
            error instanceof Error &&
            !error.message.includes("No items in cart to remove") &&
            !error.message.includes("500")
          ) {
            console.error("Error clearing cart:", error);
          }
        }
      };
      void clearCartSafely();
      return;
    }
    
    // For regular logged-in orders
    if (orderId && orderId !== "guest_checkout" && orderId !== "ItemNo12345" && orderId !== "12345" && ordermethod !== "guest" && !hasClearedOrderRef.current) {
      hasClearedOrderRef.current = true;
      const clearCartSafely = async () => {
        try {
          await clearCart();
          await refreshCart();
        } catch (error: unknown) {
          // Silently handle errors - cart might already be cleared or session invalid
          if (
            error instanceof Error &&
            !error.message.includes("No items in cart to remove") &&
            !error.message.includes("500")
          ) {
            console.error("Error clearing cart:", error);
          }
        }
      };
      getUserData();
      void clearCartSafely();
    } else if (orderId && orderId !== "guest_checkout" && orderId !== "ItemNo12345" && orderId !== "12345" && ordermethod !== "guest") {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, ordermethod, localStorageOrderData]); // Only run when orderId, ordermethod, or localStorageOrderData changes

  // Prepare guest order data
  const guestOrderData = ordermethod === "guest" ? {
    order: {
      orderNumber: order_id,
      total: amount,
      subtotal: subtotal,
      shippingTotal: shippingTotal,
      lineItems: {
        nodes: lineItems.nodes,
      },
      date: date,
    },
  } : null;

  // Guest checkout payment details
  const guestPaymentDetails: PaymentDetailsWithoutUrls = useMemo(
    () => ({
      order_id: guestOrderData?.order?.orderNumber ?? "",
      subtotal: guestOrderData?.order?.subtotal,
      amount: guestOrderData?.order?.total ?? "",
      currency: "LKR",
      first_name:
        customerData?.customer?.shipping?.firstName ?? "no_first_name",
      last_name: customerData?.customer?.shipping?.lastName ?? "no_last_name",
      email: customerData?.customer?.email ?? "no_email",
      phone: customerData?.customer?.shipping?.phone ?? "no_phone",
      shippingAddress1:
        shippingaddress1 ?? "no_shipping_address1",
      shippingAddress2:
        shippingaddress2 ?? "no_shipping_address2",
      billingAddress1:
        billingaddress1 ?? "no_billing_address1",
      billingAddress2:
        billingaddress2 ?? "no_billing_address2",
      city: city ?? "no_city",
      country: "Sri Lanka",
    }),
    [guestOrderData, customerData, shippingaddress1, shippingaddress2, billingaddress1, billingaddress2, city],
  );

  // Regular order payment details
  const regularPaymentDetails: PaymentDetailsWithoutUrls = useMemo(
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
    }),
    [orderData, customerData],
  );

  // Empty effect for potential future use
  useEffect(() => {
    // window.location.reload()
  }, []);

  if (ordermethod === "guest") {
    return (
      <>
        <div className="container mx-auto rounded-3xl text-center lg:p-20">
          <div className="my-4">
            <OrderDetails orderData={guestOrderData} />
            <div className="">
              <div className="">
                <ProductTable
                  lineItems={guestOrderData?.order?.lineItems?.nodes}
                  orderData={guestOrderData}
                  paymentDetails={guestPaymentDetails}
                />
              </div>
            </div>
          </div>
          <h1 className="pb-4 pt-20 text-center text-2xl font-bold">
            To Explore Our Product Range Further!
          </h1>
          <Link href={`/`} passHref>
            <ButtonPrimary>Shop More</ButtonPrimary>
          </Link>
        </div>
      </>
    );
  }


  if (orderId === "guest_checkout" && searchParams == null) {
    return (
      <h1 className="py-20 text-center text-2xl font-bold">
        📝 The page is unable to load
      </h1>
    );
  }

  if (orderId == "ItemNo12345") {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          📝 The page is unable to load the order ID since it{"'"}s a Payhere
          testing ID.
        </h1>
        <Link href={`/`} passHref>
          <div className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </div>
        </Link>
      </div>
    );
  }

  if (!orderId || orderId == "12345") {
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
        <Link href={`/`} passHref>
          <p className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </p>
        </Link>
      </div>
    );
  }

  if (status === "FAILURE") {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          Your order has been failed to be placed📦<br />
          Koko Payment Error
        </h1>
      </div>
    );
  }

  // Use localStorage data if available (for guest NDB Pay orders)
  const finalOrderData = localStorageOrderData?.checkout || orderData;
  
  // If query failed but we have localStorage data, use that instead
  if (orderError && !localStorageOrderData && !isCheckingLocalStorage) {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          Not authorized to view this order
        </h1>
        <Link href={`/`} passHref>
          <div className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </div>
        </Link>
      </div>
    );
  }

  // Show loading while checking localStorage
  if (isCheckingLocalStorage && !orderData && !localStorageOrderData) {
    return (
      <div className="container mx-auto grid items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  // If we have localStorage data, use it to create payment details
  const localStoragePaymentDetails: PaymentDetailsWithoutUrls = useMemo(
    () => {
      if (!localStorageOrderData?.checkout) return regularPaymentDetails;
      
      const checkout = localStorageOrderData.checkout;
      return {
        order_id: checkout?.order?.orderNumber ?? checkout?.order?.databaseId?.toString() ?? "",
        items: checkout?.order?.lineItems?.nodes ?? [],
        subtotal: checkout?.order?.subtotal,
        amount: checkout?.order?.total ?? "",
        currency: "LKR",
        first_name: checkout?.customer?.billing?.firstName ?? checkout?.customer?.shipping?.firstName ?? "no_first_name",
        last_name: checkout?.customer?.billing?.lastName ?? checkout?.customer?.shipping?.lastName ?? "no_last_name",
        email: checkout?.customer?.billing?.email ?? checkout?.customer?.email ?? "no_email",
        phone: checkout?.customer?.billing?.phone ?? checkout?.customer?.shipping?.phone ?? "no_phone",
        shippingAddress1: checkout?.customer?.shipping?.address1 ?? "no_shipping_address1",
        shippingAddress2: checkout?.customer?.shipping?.address2 ?? "no_shipping_address2",
        billingAddress1: checkout?.customer?.billing?.address1 ?? "no_billing_address1",
        billingAddress2: checkout?.customer?.billing?.address2 ?? "no_billing_address2",
        city: checkout?.customer?.shipping?.city ?? "no_city",
        country: "Sri Lanka",
      };
    },
    [localStorageOrderData, regularPaymentDetails],
  );

  const displayOrderData = localStorageOrderData?.checkout || orderData;
  const displayPaymentDetails = localStorageOrderData ? localStoragePaymentDetails : regularPaymentDetails;

  if (!displayOrderData) {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          Order not found
        </h1>
        <Link href={`/`} passHref>
          <div className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto rounded-3xl text-center lg:p-20">
      <div className="my-4">
        <OrderDetails orderData={displayOrderData} />
        <div className="">
          <div className="">
            <ProductTable
              lineItems={displayOrderData?.order?.lineItems?.nodes}
              orderData={displayOrderData}
              paymentDetails={displayPaymentDetails}
            />
          </div>
        </div>
      </div>
      <h1 className="pb-4 pt-20 text-center text-2xl font-bold">
        To Explore Our Product Range Further!
      </h1>
      <Link href={`/`} passHref>
        <ButtonPrimary>Shop More</ButtonPrimary>
      </Link>
    </div>
  );
}
