"use client";
import { OrderPaymentPageProps } from "@/data/types";
import { useQuery } from "@apollo/client";
import {
  GET_SINGLE_ORDER
} from "@/graphql/defs/order"

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params['order-id'];

  const { loading, error, data, refetch } = useQuery(GET_SINGLE_ORDER, {
    variables: {
      orderID: orderId,
    }
  });

  console.log({ data })

  return (
    <p>
      Post: {orderId}
    </p>
  );

}
