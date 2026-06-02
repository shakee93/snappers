"use client";
import {
  PayhereStatus,
  PayhereTransactionData,
  PaymentDetailsWithoutUrls,
} from "@/data/types";
import { extractRawAmount, getPaymentHash, numberFormat, TEST_STATIC_DATA } from "@/components/AddressPageComps/HelperComps";
import { siteConfig } from "@/site.config";

// const MERCHANT_ID = "1225436";
const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID;
const TEST: boolean = process.env.NEXT_PUBLIC_PAYHERE_IS_TESTING === "true" ? true : false;

// Like same in the Helpoer comps change the TEST to true or false

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


  let order_id: string | undefined = TEST
    ? "ItemNo12345"
    : paymentDetails_?.order_id;

  let amount: string | undefined = TEST
    ? "100.00"
    : numberFormat(extractRawAmount(paymentDetails_?.amount), 2, ".", ""); 

  let host = window.location.host
  let notify_url = `${siteConfig.url.base}/api/notify`

  return {
    sandbox: TEST ? true : false,
    merchant_id: TEST ? "1225436" : MERCHANT_ID ?? "",
    return_url: `https://${host}/return`,
    cancel_url: `https://${host}/cancel`,
    notify_url: notify_url,
    order_id: order_id,
    items: JSON.stringify(paymentDetails_?.items) ?? "gq mobiles",
    hash: hash,
    amount: amount,
    currency: siteConfig.locale.currencyCode,
    first_name: paymentDetails_?.first_name,
    last_name: paymentDetails_?.last_name,
    email: paymentDetails_?.email,
    phone: paymentDetails_?.phone ?? "0771234567",
    address: paymentDetails_?.address,
    city: paymentDetails_?.city,
    country: siteConfig.locale.countryName,
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
  //   return data;
  // };

  const initiatePayment = async (
    paymentDetails: PaymentDetailsWithoutUrls | null,
    setPayhereHandleStatus: (status: PayhereStatus) => void
  ) => {
    

    if (window?.payhere ) {
      if (!paymentDetails) {
        alert("No payment details provided");
        return null;
      }
      
      // this for real data
      let dynamicData = await tranformDataForPayhere(paymentDetails);
      // let dynamicDataTest = await tranformDataForPayhere(TEST_STATIC_DATA);

      if(!window?.payhere) {
        alert("Payhere is not initialized");
        return;
      }
      setPayhereHandleStatus("loading");
      window?.payhere.startPayment(dynamicData);
      

      window.onerror = function onError(error: any) {
        // setPayhereHandleStatus("error");
        // alert("Error Happened while Payhere:" + error);
      };
      
      window.payhere.onError = function onError(error: any) {
        setPayhereHandleStatus("error");
        // alert("Error Happened while Payhere:" + error);
        alert("Error Happened while Payhere:" + error);
      };

      window.payhere.onDismissed = function onDismissed() {
        setPayhereHandleStatus("dismissed");
        // alert("Dismissed");
      }

      // Payment completed. It can be a successful failure.
      window.payhere.onCompleted = function onCompleted(orderId: any) {
        setPayhereHandleStatus("finished");
        
        // onPaymentCompleted(paymentDetails, orderId);
        // completePaymentWithOrder(orderId)
        // .then((data: any) => {
        // })
        // .catch((e: any) => {
        //   alert("Something went wrong on the PAYHERE PAYMENT PROCESS");
        // });
        // window.location.href = `/checkout/${orderId}`;
      };
    }
    else {
      alert("Payhere is not initialized");
      return;
    }
  };
  return initiatePayment;
};
