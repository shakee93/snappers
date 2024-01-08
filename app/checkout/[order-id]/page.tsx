"use client";
import { OrderPaymentPageProps } from "@/data/types";
import { useQuery } from "@apollo/client";
import { GET_SINGLE_ORDER } from "@/graphql/defs/order";
import PayHerePayment from "@/app/components/Payhere/Base";


export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params["order-id"];

  const { loading, error, data, refetch } = useQuery(GET_SINGLE_ORDER, {
    variables: {
      orderID: orderId,
    },
  });

  console.log({ data });

  return (
    <div>
      <p>Post: {orderId}</p>
      <PayHerePayment/>
    </div>
  );
}
