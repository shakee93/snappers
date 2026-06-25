/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { OrderPaymentPageProps, PaymentDetailsWithoutUrls } from "@/data/types";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CHECKOUT_USER_DETAILS,
  GET_SINGLE_ORDER,
} from "@/graphql/defs/order";
import { useEffect, useMemo, useRef, useState, use, type ReactNode } from "react";
import { mergeThankYouOrderData } from "@/components/account/accountOrderUtils";
import ProductTable, { OrderDetails } from "./Comps";
import type { ComponentProps } from "react";

type ThankYouOrderData = ComponentProps<typeof OrderDetails>["orderData"];
import { toast } from "sonner";
import Link from "next/link";
import ButtonBrand from "shared/Button/ButtonBrand";
import Logo from "@/components/header/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartProvider";

const ORDER_PAGE_SHELL = "min-h-screen bg-[#FAFAF8]";
const ORDER_PAGE_CONTAINER =
  "container mx-auto max-w-4xl px-4 py-10 text-left lg:py-16";

function OrderConfirmationLayout({ children }: { children: ReactNode }) {
  return (
    <div className={ORDER_PAGE_SHELL}>
      <div className={ORDER_PAGE_CONTAINER}>
        <div className="mb-8">
          <Logo imageClass="h-9 sm:h-[31px] hover:scale-100" />
        </div>
        {children}
      </div>
    </div>
  );
}

function OrderConfirmationFooter() {
  return (
    <div className="mt-16 text-center">
      <p className="text-lg font-semibold text-[#092412]">
        To Explore Our Product Range Further!
      </p>
      <ButtonBrand href="/" className="mt-5">
        Shop More
      </ButtonBrand>
    </div>
  );
}

export default function OrderPaymentPage(props: OrderPaymentPageProps) {
  const params = use(props.params);
  const router = useRouter();
  const orderId = params["order-id"];

  // Call useSearchParams once and reuse it
  const searchParamsObj = useSearchParams();
  const searchParams = searchParamsObj.get("email");

  // All hooks must be called at the top level, before any conditional returns
  const { getCart, clearCart, refreshCart } = useCart();
  const [getUserData, { data: customerData }] = useLazyQuery(
    GET_CHECKOUT_USER_DETAILS,
    { fetchPolicy: "no-cache" },
  );

  const order_id = searchParamsObj.get('order_id');
  const first_name = searchParamsObj.get('first_name');
  const last_name = searchParamsObj.get('last_name');
  const email = searchParamsObj.get('email');
  const address = searchParamsObj.get('address');
  const amount = searchParamsObj.get('amount');
  const items = searchParamsObj.get('items');
  const shippingTotal = searchParamsObj.get('shippingTotal');
  const subtotal = searchParamsObj.get('subtotal');
  const date = searchParamsObj.get('date');
  const shippingaddress1 = searchParamsObj.get('shippingaddress1');
  const shippingaddress2 = searchParamsObj.get('shippingaddress2');
  const billingaddress1 = searchParamsObj.get('billingaddress1');
  const billingaddress2 = searchParamsObj.get('billingaddress2');
  const city = searchParamsObj.get('city');
  const lineItemsParam = searchParamsObj.get('lineItems');
  const lineItems = lineItemsParam && lineItemsParam !== "undefined"
    ? JSON.parse(lineItemsParam)
    : { nodes: [] };
  const shippingMethodLabel = searchParamsObj.get("shippingMethodLabel");
  const deliveryType = searchParamsObj.get("deliveryType");
  const ordermethod = searchParamsObj.get('ordermethod');

  //Koko Payment
  const trnId = searchParamsObj.get('trnId');
  const orderIdParam = searchParamsObj.get('orderId') || (typeof window !== 'undefined' ? window.location.pathname.split('/')[2] || '' : '');
  const orderIdUrl = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';
  const status = searchParamsObj.get('status');
  const desc = searchParamsObj.get('desc');
  const key = searchParamsObj.get('key');
  const wcApi = searchParamsObj.get('wc-api');


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

  // Query for order data (will be skipped for guest checkouts)
  const { data: orderData, error: orderError } = useQuery(GET_SINGLE_ORDER, {
    variables: { orderID: orderId },
    skip: !orderId || orderId === "guest_checkout" || orderId === "ItemNo12345" || orderId === "12345" || ordermethod === "guest",
    fetchPolicy: "cache-and-network",
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
      deliveryType,
      shippingMethodLabel,
      shippingLines: shippingMethodLabel
        ? { nodes: [{ methodTitle: shippingMethodLabel }] }
        : undefined,
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

  const displayOrderData = useMemo(
    () =>
      mergeThankYouOrderData(
        orderData,
        localStorageOrderData,
        orderId,
      ) as ThankYouOrderData,
    [orderData, localStorageOrderData, orderId],
  );

  // Empty effect for potential future use
  useEffect(() => {
    // window.location.reload()
  }, []);

  if (ordermethod === "guest") {
    return (
      <OrderConfirmationLayout>
        <OrderDetails orderData={guestOrderData} />
        <ProductTable
          lineItems={guestOrderData?.order?.lineItems?.nodes}
          orderData={guestOrderData}
          paymentDetails={guestPaymentDetails}
        />
        <OrderConfirmationFooter />
      </OrderConfirmationLayout>
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
        <Link href={`/`}>
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
        <Link href={`/`}>
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

  // If query failed and we have no localStorage data, show error
  if (orderError && !localStorageOrderData && !isCheckingLocalStorage) {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          Not authorized to view this order
        </h1>
        <Link href={`/`}>
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-header-green border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  const displayPaymentDetails = localStorageOrderData && !orderData ? localStoragePaymentDetails : regularPaymentDetails;

  if (!displayOrderData) {
    return (
      <div className="container mx-auto grid items-center justify-center">
        <h1 className="py-20 text-center text-2xl font-bold">
          Order not found
        </h1>
        <Link href={`/`}>
          <div className="self-center text-center font-bold text-blue-500 underline hover:cursor-pointer hover:text-blue-800">
            Back to Home
          </div>
        </Link>
      </div>
    );
  }

  return (
    <OrderConfirmationLayout>
      <OrderDetails orderData={displayOrderData} />
      <ProductTable
        lineItems={displayOrderData?.order?.lineItems?.nodes ?? undefined}
        orderData={displayOrderData}
        paymentDetails={displayPaymentDetails}
      />
      <OrderConfirmationFooter />
    </OrderConfirmationLayout>
  );
}
