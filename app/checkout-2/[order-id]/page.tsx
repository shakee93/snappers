/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { OrderPaymentPageProps, PaymentDetailsWithoutUrls } from "@/data/types";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CHECKOUT_USER_DETAILS,
  GET_SINGLE_ORDER,
} from "@/graphql/defs/order";
import { useCallback, useEffect, useMemo } from "react";
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
  const orderIdParam = useSearchParams().get('orderId') || (window.location.pathname.split('/')[2] || '');
  const orderIdUrl = window.location.pathname.split('/')[2]
  const status = useSearchParams().get('status');
  const desc = useSearchParams().get('desc');
  const key = useSearchParams().get('key');
  const wcApi = useSearchParams().get('wc-api');

  
  const lastOrder = localStorage.getItem('last_order');
  if (lastOrder && trnId && status !== "FAILURE") {
    router.push(`/checkout/koko/guest_order?orderId=${orderIdUrl}&status=${status}`);
  }

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
  }, [orderId, status]); // Dependencies to trigger the effect


  if (ordermethod === "guest") {
    // Clear cart for guest checkout completion
    const { clearCart: guestClearCart, refreshCart: guestRefreshCart } = useCart();
    
    useEffect(() => {
      const clearCartSafely = async () => {
        try {
          await guestClearCart();
          await guestRefreshCart();
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
    }, [guestClearCart, guestRefreshCart]);

    const orderData = {
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
    };

    const temporaryPaymentDetails: PaymentDetailsWithoutUrls = useMemo(
      () => ({
        order_id: orderData?.order?.orderNumber ?? "",
        // items: orderData?.order?.lineItems?.nodes ?? [],
        subtotal: orderData?.order?.subtotal,
        amount: orderData?.order?.total ?? "",
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
      [orderData, customerData],
    );

    return (
      <>
        <div className="container mx-auto rounded-3xl text-center lg:p-20">
          <div className="my-4">
            <OrderDetails orderData={orderData} />
            <div className="">
              <div className="">
                <ProductTable
                  lineItems={orderData?.order?.lineItems?.nodes}
                  orderData={orderData}
                  paymentDetails={temporaryPaymentDetails}
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
    // Clear cart for simple guest checkout completion
    const { clearCart: simpleClearCart, refreshCart: simpleRefreshCart } = useCart();
    
    useEffect(() => {
      const clearCartSafely = async () => {
        try {
          await simpleClearCart();
          await simpleRefreshCart();
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
    }, [simpleClearCart, simpleRefreshCart]);

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

  const { getCart, clearCart } = useCart();

  const refreshCart = useCallback(async () => {
    try {
      await getCart();
    } catch (error: any) {
      console.error("Error refreshing the cart:", error);
      throw error;
    }
  }, [getCart]);


  const { data: orderData, error: orderError } = useQuery(GET_SINGLE_ORDER, {
    variables: { orderID: orderId },
  });


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

    getUserData();
    void clearCartSafely();
  }, [getUserData, clearCart, refreshCart]);

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

  if (orderError) {
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
    }),
    [orderData, customerData],
  );

  useEffect(() => {
    // window.location.reload()
  }, []);

  return (
    <div className="container mx-auto rounded-3xl text-center lg:p-20">
      <div className="my-4">
        <OrderDetails orderData={orderData} />
        <div className="">
          <div className="">
            <ProductTable
              lineItems={orderData?.order?.lineItems?.nodes}
              orderData={orderData}
              paymentDetails={temporaryPaymentDetails}
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
