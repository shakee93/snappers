"use client";
import { PaymentDetailsWithoutUrls } from "@/data/types";
import { extractRawAmount } from "@/components/AddressPageComps/HelperComps";
import { useMutation } from "@apollo/client";
import { COMPLETE_ORDER_PAYMENT } from "@/graphql/defs/order";

const MERCHANT_ID = "1225436";
const TEST: boolean = true;
// NOTES: Constant to follow while testing the payhere.
//  order_id : "ItemNo12345"
//  amount : "100.00"
const staticData = {
  sandbox: true,
  merchant_id: "1225436",
  return_url: "http://localhost:3000/success",
  cancel_url: "http://localhost:3000/cancel",
  notify_url: "http://localhost:3000/notify",
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
  custom_1: "",
  custom_2: "",
};

const getDynamicData = async (paymentDetails_: PaymentDetailsWithoutUrls) => {
  let hash = await getPaymentHash(paymentDetails_);
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

  let order_id = TEST ? "ItemNo12345" : paymentDetails_?.order_id;
  let amount = TEST ? "100.00" : extractRawAmount(paymentDetails_?.amount);

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
    city: "Colombo",
    country: "Sri Lanka",
  };
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

    console.log("Data sent to create hash:", requestData);

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

export const usePayhere = () => {
  const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);

  const completePaymentWithOrder = async (orderId: string) => {
    const { data } = await completeOrderPayment({
      variables: {
        input: { orderId: TEST? 1234: orderId, status: "COMPLETED" }
      },
    });
    console.log("data on the complete order Mutation: ", data);
    return data;
  };

  const initiatePayment = async (
    paymentDetails: PaymentDetailsWithoutUrls | null
  ) => {
    if (window?.payhere) {
      if (!paymentDetails) {
        alert("No payment details provided");
        return null;
      }
      console.log("initiate Payment paymentDetails: ", paymentDetails);

      // use staticData var for the check the payhere integration
      let dynamicData = await getDynamicData(staticData);

      // this for real data
      // let dynamicData = await getDynamicData(paymentDetails);
      console.log("dynamic data: ", dynamicData);
      window?.payhere.startPayment(dynamicData);
      window.onerror = function onError(error: any) {
        console.log("Error:" + error);
      };
      window.onerror = function onError(error: any) {
        console.log("Error:" + error);
      };
      // Payment completed. It can be a successful failure.
      window.payhere.onCompleted = function onCompleted(orderId: any) {
        completePaymentWithOrder(orderId)
          .then((data: any) => {
            console.log("Payhere Completion data: ", data);
            window.location.href = `/checkout/${orderId}`;
          })
          .catch((e: any) => {
            console.log("Error on payhere Complete: ", e);
            alert("Something went wrong on the PAYHERE PAYMENT PROCESS");
          });
      };
    }
  };
  return initiatePayment;
};
