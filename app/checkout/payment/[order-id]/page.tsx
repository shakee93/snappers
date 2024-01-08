"use client";
import { OrderPaymentPageProps } from "@/data/types";

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params["order-id"];

  return(

  <div>
    <a href="https://52.45.14.64/transfer-session?session_id=29&_wc_checkout=d282bc2068">
      GO TO PAGE
    </a>
    <p>Post: {orderId} </p>;
  </div>

  )
}
