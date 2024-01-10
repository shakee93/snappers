"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { Button } from "@nextui-org/react";
import { PaymentDetailsType, PaymentDetailsWithoutUrls } from "@/data/types";
import { extractRawAmount } from "@/components/AddressPageComps/HelperComps";

declare global {
  interface Window {
    payhere: {
      startPayment: (paymentDetails: any) => void | null;
      onDismissed: () => void | null;
      onError: (error: any) => void | null;
    } | null;
  }
}
type PayHerePaymentProps = {
  paymentDetails: PaymentDetailsWithoutUrls;
};

const PayHerePayment: React.FC<PayHerePaymentProps> = ({ paymentDetails }) => {
  const [hash, setHash] = useState<string | null>(null);

  const staticData: PaymentDetailsType = useMemo(() => {
    return {
      sandbox: true,
      merchant_id: "1225436",
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      notify_url: "http://localhost:3000/notify",
      order_id: "12345",
      items: "gq mobiles",
      hash: hash,
      amount: "100.00",
      currency: "LKR",
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      phone: "0771234567",
      address: "No.1, Galle Road",
      city: "Colombo",
      country: "Sri Lanka",
    };
  }, [hash]);

  const dynamicData: PaymentDetailsType = useMemo(() => {
    return {
      sandbox: true,
      merchant_id: "1225436",
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      notify_url: "http://localhost:3000/notify",
      order_id: "12345",
      items: paymentDetails.items,
      hash: hash,
      amount: extractRawAmount(paymentDetails?.amount ?? ""),
      currency: "LKR",
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email: paymentDetails.email,
      phone: paymentDetails.phone,
      address: paymentDetails.address,
      city: "Colombo",
      country: "Sri Lanka",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  const initiatePayment = useCallback(async () => {
    if (window?.payhere) {
      window?.payhere.startPayment(dynamicData);
      window.onerror = function onError(error: any) {
        console.log("Error:" + error);
      };
    }
  }, [dynamicData]);

  useEffect(() => {
    // Define event handlers
    const onDismissed = () => {
      console.log("Payment dismissed");
    };

    const onError = (error: any) => {
      console.log("Error:", error);
    };

    // Attach event handlers
    if (window.payhere) {
      window.payhere.onDismissed = onDismissed;
      window.payhere.onError = onError;
    }

    // Fetch the hash
    const getPaymentHash = async () => {
      try {
        const response = await fetch("/api/payhere", {
          // Ensure the endpoint is correct
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            merchant_id: "1225436",
            order_id: "12345",
            amount: "100.00",
            currency: "LKR",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHash(data.hash);
      } catch (error) {
        console.error("Failed to fetch hash:", error);
      }
    };

    getPaymentHash();

    // Clean up event handlers
    return () => {
      if (window.payhere) {
        window.payhere.onDismissed = () => null;
        window.payhere.onError = () => null;
      }
    };
  }, []);

  if (!paymentDetails) {
    return <p>No Amount found</p>;
  }

  return (
    <>
      <Script
        type="text/javascript"
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="beforeInteractive"
        onLoad={() => console.log("PayHere script loaded")}
        onError={() => console.error("Error loading PayHere script")}
      />
      <Button onClick={initiatePayment}>Pay with PayHere</Button>
    </>
  );
};

export default PayHerePayment;
