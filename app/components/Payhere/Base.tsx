"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";

const PayHerePayment = ({ paymentDetails }: any) => {
  const [hash, setHash] = useState(null);

  const fakePaymentDetails = useMemo(() => {
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

  const initiatePayment = useCallback(async () => {
    if (window?.payhere) {
      window?.payhere.startPayment(fakePaymentDetails);
      window.onError = function onError(error: any) {
        console.log("Error:" + error);
      };
    } else {
      debugger;
    }
  }, [fakePaymentDetails]);

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
        const response = await fetch("/api/payhere", { // Ensure the endpoint is correct
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
        window.payhere.onDismissed = null;
        window.payhere.onError = null;
      }
    };
  }, []);
  return (
    <>
      <Script
        type="text/javascript"
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('PayHere script loaded')}
        onError={() => console.error('Error loading PayHere script')}
      />
      <button onClick={initiatePayment}>Pay with PayHere</button>
    </>
  );
};

export default PayHerePayment;
