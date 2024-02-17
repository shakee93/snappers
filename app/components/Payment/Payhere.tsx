"use client";
import {
  PayhereTransactionData,
  PaymentDetailsWithoutUrls,
} from "@/data/types";
import { extractRawAmount } from "@/components/AddressPageComps/HelperComps";

const MERCHANT_ID = "1225436";
const TEST: boolean = true;

// NOTES: Constant to follow while testing the payhere.
//  order_id : "ItemNo12345"
//  amount : "100.00"

const domain = process.env.NEXT_PUBLIC_DOMAIN;

const STATIC_DATA = {
  sandbox: true,
  merchant_id: MERCHANT_ID,
  return_url: `${domain}/success`,
  cancel_url: `${domain}/cancel`,
  notify_url: `${domain}/notify`,
  order_id: "ItemNo12345",
  items: "gq mobiles",
  hash: null,
  amount: "100.00",
  currency: "LKR",
  first_name: "Saman",
  last_name: "Perera",
  email: "samanp@gmail.com",
  phone: "0771234567",
  address: "No.1, Galle Road",
  city: "Colombo",
  country: "Sri Lanka",
  delivery_address: "No. 46, Galle road, Kalutara South",
  delivery_city: "Kalutara",
  delivery_country: "Sri Lanka",
};

const getPaymentHash = async (dynamicData: any) => {
  try {
    const amount = TEST ? "100.00" : extractRawAmount(dynamicData?.amount);
    const requestData = {
      merchant_id: MERCHANT_ID,
      order_id: dynamicData.order_id,
      amount: amount,
      currency: "LKR",
    };

    const response = await fetch("/api/payhere", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error("Failed to fetch hash:", error);
  }
};

const tranformDataForPayhere = async (
  paymentDetails_: PaymentDetailsWithoutUrls
): Promise<PayhereTransactionData | null> => {
  let hash: string | null = await getPaymentHash(paymentDetails_);
  if (!hash) {
    alert("hash Can not be generated");
    return null;
  }

  console.log("final Data which pushed to the payhere:", {
    merchant_id: MERCHANT_ID,
    order_id: paymentDetails_.order_id,
    amount: extractRawAmount(paymentDetails_?.amount ?? ""),
    currency: "LKR",
  });

  let order_id: string | undefined = TEST
    ? "ItemNo12345"
    : paymentDetails_?.order_id;
  let amount: string | undefined = TEST
    ? "100.00"
    : extractRawAmount(paymentDetails_?.amount);

  if (TEST && false) {
    if (hash === null) {
      return null;
    }
    const dataWithHash = {
      ...STATIC_DATA,
      hash: hash as string,
    };
    return dataWithHash;
  }

  return {
    sandbox: true,
    merchant_id: MERCHANT_ID,
    return_url: "http://localhost:3000/checkout",
    cancel_url: "http://localhost:3000/cancel",
    notify_url: "http://localhost:3000/notify",
    order_id: order_id,
    items: JSON.stringify(paymentDetails_?.items) ?? "gq mobiles",
    hash: hash,
    amount: amount,
    currency: "LKR",
    first_name: paymentDetails_?.first_name,
    last_name: paymentDetails_?.last_name,
    email: paymentDetails_?.email,
    phone: paymentDetails_?.phone ?? "0771234567",
    address: paymentDetails_?.address,
    city: paymentDetails_?.city,
    country: "Sri Lanka",
  };
};

export const usePayhere = () => {
  // const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);

  // const completePaymentWithOrder = async (orderId: string) => {
  //   const { data } = await completeOrderPayment({
  //     variables: {
  //       input: { orderId: TEST ? 1234 : orderId, status: "COMPLETED" }
  //     },
  //   });
  //   console.log("data on the complete order Mutation: ", data);
  //   return data;
  // };

  const initiatePayment = async (
    paymentDetails: PaymentDetailsWithoutUrls | null
  ) => {
    console.log("paymentDetails in initatePayment: ", paymentDetails);

    // Continue from here
    if (window?.payhere) {
      let TESTING_PAYHERE = false;

      if (!paymentDetails && TESTING_PAYHERE) {
        alert("No payment details provided");
        return null;
      }

      // let dynamicData = await tranformDataForPayhere(paymentDetails);

      // use STATIC_DATA var for the test the payhere integration
      let dynamicData = await tranformDataForPayhere(STATIC_DATA);

      // this for real data
      // let dynamicData = await getDynamicData(paymentDetails);
      // onPaymentCompleted(paymentDetails, "1234");

      window?.payhere.startPayment(dynamicData);

      window.onerror = function onError(error: any) {
        console.log("Error:" + error);
      };

      window.onerror = function onError(error: any) {
        console.log("Error:" + error);
      };

      // Payment completed. It can be a successful failure.
      window.payhere.onCompleted = function onCompleted(orderId: any) {
        console.log("completed succesffully`", orderId);
        // onPaymentCompleted(paymentDetails, orderId);
        // completePaymentWithOrder(orderId)
        // .then((data: any) => {
        //   console.log("Payhere Completion data: ", data);
        // })
        // .catch((e: any) => {
        //   console.log("Error on payhere Complete: ", e);
        //   alert("Something went wrong on the PAYHERE PAYMENT PROCESS");
        // });
        window.location.href = `/checkout/${orderId}`;
      };
    }
  };
  return initiatePayment;
};
