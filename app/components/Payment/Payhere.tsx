"use client";
import {
  PayhereStatus,
  PayhereTransactionData,
  PaymentDetailsWithoutUrls,
} from "@/data/types";
import { extractRawAmount, getPaymentHash } from "@/components/AddressPageComps/HelperComps";

// const MERCHANT_ID = "1225436";
const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID;
// const TEST: boolean = process.env.NEXT_PUBLIC_PAYHERE_IS_LIVE === "true" ? true : false;
const TEST: boolean = false;

// DOCS:
// https://support.payhere.lk/api-&-mobile-sdk/javascript-sdk
// https://www.payhere.lk/merchant/domains

// NOTE: 4916217501611292 use this visa card for testing.

const tranformDataForPayhere = async (
  paymentDetails_: PaymentDetailsWithoutUrls
): Promise<PayhereTransactionData | null> => {
  let hash: string | null = await getPaymentHash(paymentDetails_);
  if (!hash) {
    alert("hash Can not be generated");
    return null;
  }



  // console.log("final Data which pushed to the payhere:", {
  //   merchant_id: MERCHANT_ID,
  //   order_id: paymentDetails_.order_id,
  //   amount: extractRawAmount(paymentDetails_?.amount ?? ""),
  //   currency: "LKR",
  // });

  let order_id: string | undefined = TEST
    ? "ItemNo12345"
    : paymentDetails_?.order_id;
  let amount: string | undefined = TEST
    ? "100.00"
    : extractRawAmount(paymentDetails_?.amount);

  let host = window.location.host 
  console.log('host', host);

  return {
    sandbox: false,
    merchant_id: MERCHANT_ID ?? "1225436",
    return_url: `http://${host}/checkout`,
    cancel_url: `http://${host}/cancel`,
    notify_url: `http://${host}/notify`,
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
    paymentDetails: PaymentDetailsWithoutUrls | null,
    setPayhereHandleStatus: (status: PayhereStatus) => void
  ) => {
    // console.log("paymentDetails in initatePayment: ", paymentDetails);


    // Continue from here
    if (window?.payhere ) {
      if (!paymentDetails) {
        alert("No payment details provided");
        return null;
      }

      // this for real data
      let dynamicData = await tranformDataForPayhere(paymentDetails);
      // let dynamicData = await tranformDataForPayhere(TEST_STATIC_DATA);
      console.log("finalData which goes to the payhere: ", dynamicData);

      setPayhereHandleStatus("loading");
      window?.payhere.startPayment(dynamicData);

      window.onerror = function onError(error: any) {
        setPayhereHandleStatus("error");
        alert("Error Happened while Payhere:" + error);
      };
      window.payhere.onError = function onError(error: any) {
        setPayhereHandleStatus("error");
        alert("Error Happened while Payhere:" + error);
      };

      window.payhere.onDismissed = function onDismissed() {
        setPayhereHandleStatus("dismissed");
        // console.log("Dismissed");
      }

      // Payment completed. It can be a successful failure.
      window.payhere.onCompleted = function onCompleted(orderId: any) {
        // console.log("completed succesffully`", orderId);
        // alert("succussfull")
        setPayhereHandleStatus("finished");
        
        // onPaymentCompleted(paymentDetails, orderId);
        // completePaymentWithOrder(orderId)
        // .then((data: any) => {
        //   console.log("Payhere Completion data: ", data);
        // })
        // .catch((e: any) => {
        //   console.log("Error on payhere Complete: ", e);
        //   alert("Something went wrong on the PAYHERE PAYMENT PROCESS");
        // });
        // window.location.href = `/checkout/${orderId}`;
      };
    }
  };
  return initiatePayment;
};
