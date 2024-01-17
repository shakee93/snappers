"use client";
import {PaymentDetailsWithoutUrls} from "@/data/types";
import {extractRawAmount} from "@/components/AddressPageComps/HelperComps";

const MERCHANT_ID = "1225436";

const getDynamicData = async (paymentDetails_: PaymentDetailsWithoutUrls)=>{
    let hash = await getPaymentHash(paymentDetails_);
    if(!hash){
        alert('hash Can not be generated')
        return null;
    }

    return {
        sandbox: true,
        merchant_id: MERCHANT_ID,
        return_url: "http://localhost:3000/checkout",
        cancel_url: "http://localhost:3000/cancel",
        notify_url: "http://localhost:3000/notify",
        order_id: paymentDetails_?.order_id ?? "12345",
        items: JSON.stringify(paymentDetails_?.items) ?? "gq mobiles",
        hash: hash,
        amount: extractRawAmount(paymentDetails_?.amount ?? ""),
        currency: "LKR",
        first_name: paymentDetails_?.first_name,
        last_name: paymentDetails_?.last_name,
        email: paymentDetails_?.email,
        phone: paymentDetails_?.phone,
        address: paymentDetails_?.address,
        city: "Colombo",
        country: "Sri Lanka",
    }
}

const getPaymentHash = async (dynamicData: any) => {
    try {
        const response = await fetch("/api/payhere", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                merchant_id: MERCHANT_ID,
                order_id: dynamicData.order_id,
                amount: extractRawAmount(dynamicData?.amount ?? ""),
                currency: "LKR",
            }),
        });

        if (!response.ok) {
            return  new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.hash
    } catch (error) {
        console.error("Failed to fetch hash:", error);
    }
};

export const usePayhere = () => {
    // const staticData: PaymentDetailsType = useMemo(() => {
    //   return {
    //     sandbox: true,
    //     merchant_id: "1225436",
    //     return_url: "http://localhost:3000/success",
    //     cancel_url: "http://localhost:3000/cancel",
    //     notify_url: "http://localhost:3000/notify",
    //     order_id: "12345",
    //     items: "gq mobiles",
    //     hash: hash,
    //     amount: "100.00",
    //     currency: "LKR",
    //     first_name: "John",
    //     last_name: "Doe",
    //     email: "johndoe@example.com",
    //     phone: "0771234567",
    //     address: "No.1, Galle Road",
    //     city: "Colombo",
    //     country: "Sri Lanka",
    //   };
    // }, [hash]);

    const initiatePayment = async (paymentDetails: PaymentDetailsWithoutUrls | null) => {
        if (window?.payhere) {
            if(!paymentDetails){
                alert('No payment details provided')
                return null;
            }
            console.log("initiate Payment paymentDetails: ", paymentDetails);
            let dynamicData = await getDynamicData(paymentDetails);
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
                console.log("Payment completed. OrderID:" + orderId);
                window.location.href = `/checkout/${orderId}`;
            };
        }

    }
    return initiatePayment;
};
