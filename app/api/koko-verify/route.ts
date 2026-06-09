import { NextResponse } from 'next/server';
import { apiUrl } from "@/lib/api";

export async function POST(request: Request) {
  try {
    let orderStatus = "";

    const { orderId, status } = await request.json();
      // console.log("orderId", orderId);
      // console.log("status", status);
    
    orderStatus = status === "SUCCESS" ? "processing" : status === "FAILURE" ? "cancelled" : "";

    const confirmationResponse = await fetch(
      apiUrl("/wp-json/api/gq_mobile/v1/payhere-order-confirmation"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          order_status: orderStatus,
        }),
      }
    );
    
    console.log("confirmationResponse", confirmationResponse);

    const data = await confirmationResponse.json(); // Parse the response data
    return NextResponse.json(data); // Return the response data as JSON
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
