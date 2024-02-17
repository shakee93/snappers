/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { OrderPaymentPageProps, PaymentDetailsWithoutUrls } from "@/data/types";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CHECKOUT_USER_DETAILS,
  GET_SINGLE_ORDER,
} from "@/graphql/defs/order";
import { useEffect, useMemo } from "react";
import ProductTable, { OrderDetails } from "./Comps";
import toast from "react-hot-toast";
import Link from "next/link";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartProvider";

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params["order-id"];
  const searchParams = useSearchParams().get("email");

  if (orderId === "no_order_id_found" && searchParams == null) {
    return (
      <h1 className="py-20 text-center text-2xl font-bold">
        📝 The page is unable to load
      </h1>
    );
  }

  const { getCart } = useCart();

  const refreshCart = async () => {
    try {
      await getCart();
    } catch (error: any) {
      console.error("Error refreshing the cart:", error);
      throw error;
    }
  };

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

  const [getUserData, { data: customerData }] = useLazyQuery(
    GET_CHECKOUT_USER_DETAILS,
    { fetchPolicy: "no-cache" },
  );

  const { data: orderData, error: orderError } = useQuery(GET_SINGLE_ORDER, {
    variables: { orderID: orderId },
  });

  useEffect(() => {
    getUserData();
    refreshCart();
    console.log("Cart refreshed");
  }, [getUserData]);

  if (!orderId || orderId == "12345") {
    toast.error(`Order not found: ${orderId}`);
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

  if (orderId === "no_order_id_found" && searchParams) {
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
