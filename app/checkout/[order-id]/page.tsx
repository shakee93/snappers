"use client";
import { OrderPaymentPageProps, PaymentDetailsWithoutUrls } from "@/data/types";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CHECKOUT_USER_DETAILS,
  GET_SINGLE_ORDER,
} from "@/graphql/defs/order";
import PayHerePayment from "@/app/components/Payment/Payhere";
import { useEffect, useMemo } from "react";
import ProductTable, { OrderDetails } from "./Comps";
import OrderPaymentPageSkeleton from "./Skeleton";
import BankTransfer from "@/app/components/Payment/BankTransfer";

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params["order-id"];

  const [getUserData, { data: customerData }] = useLazyQuery(
    GET_CHECKOUT_USER_DETAILS,
    { fetchPolicy: "no-cache" }
  );
  const { data: orderData } = useQuery(GET_SINGLE_ORDER, {
    variables: { orderID: orderId },
  });

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  const temporaryPaymentDetails: PaymentDetailsWithoutUrls = useMemo(
    () => ({
      order_id: orderData?.order?.orderNumber ?? "",
      items: orderData?.order?.lineItems?.nodes ?? [],
      subtotal: orderData?.order?.subtotal ,
      amount: orderData?.order?.total ?? "" ,
      currency: "LKR",
      first_name:
        customerData?.customer?.shipping?.firstName ?? "no_first_name",
      last_name: customerData?.customer?.shipping?.lastName ?? "no_last_name",
      email: customerData?.customer?.email ?? "no_email",
      phone: customerData?.customer?.shipping?.phone ?? "no_phone",
      address: customerData?.customer?.shipping?.address1 ?? "no_address",
      city: customerData?.customer?.shipping?.city ?? "no_city",
      country: "Sri Lanka",
    }),
    [orderData, customerData]
  );

  // if(!orderData?.order){
  //   return <OrderPaymentPageSkeleton/>
  // }

  return (
    <div className="container mx-auto rounded-3xl lg:p-20 text-center ">
      <div className="my-4 ">
        <OrderDetails orderData={orderData} />

        <div className="pt-6">
          <div className="">
            {/* {data?.order.paymentMethod === "payhere" ? <PayHerePayment/> : "Continue with Bank Transfer"} */}
            {/* && data?.order.paymentMethod === "payhere" && */}
            {/* {temporaryPaymentDetails && ( */}
              <PayHerePayment paymentDetails={temporaryPaymentDetails} />
            {/* // )} */}
            <BankTransfer/>
          </div>
        </div>
        <ProductTable lineItems={orderData?.order?.lineItems?.nodes} />
      </div>
    </div>
  );
}
