"use client";
import { OrderPaymentPageProps } from "@/data/types";

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params['order-id'];

  return <p>Post: {orderId} </p>;
}
