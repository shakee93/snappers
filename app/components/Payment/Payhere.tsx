"use client";
import {PaymentDetailsType, PaymentDetailsWithoutUrls} from "@/data/types";
import {extractRawAmount} from "@/components/AddressPageComps/HelperComps";
import {useEffect, useState} from "react";


type PayHerePaymentProps = {
    paymentDetails: PaymentDetailsWithoutUrls | null;
    // ref: React.Ref<{ initiatePayment: () => void } | null>;
};


export const usePayhere = ({paymentDetails}: PayHerePaymentProps) => {
    // const [hash, setHash] = useState<string | null>(null);
    const [paymentDetails_, setPaymentDetails_] = useState(paymentDetails)
    //
    // // setPaymentDetails_(paymentDetails_)
    useEffect(()=>{
        console.log("payment details: ", paymentDetails_)
    },[paymentDetails])
    // if (!paymentDetails) {
    //     // toast.error("No payment Details provided for the payhere")
    //     return null
    // }

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

    const dynamicData: PaymentDetailsType = {
        sandbox: true,
        merchant_id: "1225436",
        return_url: "http://localhost:3000/checkout",
        cancel_url: "http://localhost:3000/cancel",
        notify_url: "http://localhost:3000/notify",
        order_id: paymentDetails?.order_id ?? "12345",
        items: paymentDetails?.items,
        hash: null,
        amount: extractRawAmount(paymentDetails?.amount ?? ""),
        currency: "LKR",
        first_name: paymentDetails?.first_name,
        last_name: paymentDetails?.last_name,
        email: paymentDetails?.email,
        phone: paymentDetails?.phone,
        address: paymentDetails?.address,
        city: "Colombo",
        country: "Sri Lanka",
    };

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
                return  new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // setHash(data.hash);
            return data.hash
        } catch (error) {
            console.error("Failed to fetch hash:", error);
        }
    };


    const initiatePayment = async () => {
        // console.log("payment details on the initiate", paymentDetails_);
        // if(!paymentDetails_){
        //     console.log("payment Details not found")
        //     return null
        //
        // }
        //
        if (window?.payhere) {
            dynamicData['hash'] = await getPaymentHash();
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

        // useEffect(() => {
        //   // Define event handlers
        //   const onDismissed = () => {
        //     console.log("Payment dismissed");
        //   };
        //
        //   const onError = (error: any) => {
        //     console.log("Error:", error);
        //   };
        //
        //   // Attach event handlers
        //   if (window.payhere) {
        //     window.payhere.onDismissed = onDismissed;
        //     window.payhere.onError = onError;
        //   }
        //
        //   // Fetch the hash
        //
        //
        //   getPaymentHash();
        // }, []);

      // Return the function to initiate payment
    }
    return initiatePayment;
};


// type PayHerePaymentProps = {
//   paymentDetails: PaymentDetailsWithoutUrls;
//   // ref: React.Ref<{ initiatePayment: () => void } | null>;
// };;

// // Test Card details are available at https://support.payhere.lk/sandbox-and-testing
// const PayHerePayment: React.FC<PayHerePaymentProps> = ({
//   paymentDetails,
//   // ref
// }) => {

//   return (
//     <>
//       <Script
//         type="text/javascript"
//         src="https://www.payhere.lk/lib/payhere.js"
//         onLoad={() => console.log("PayHere script loaded")}
//         onError={() => console.error("Error loading PayHere script")}
//       />
//       <div className="grid items-center justify-center">
//         <ButtonPrimary className="w-fit my-8 mx-auto" onClick={initiatePayment}>
//           Pay with PayHere
//         </ButtonPrimary>
//         <Image
//           alt="payment gateway"
//           loading="lazy"
//           width={1000}
//           height={1000}
//           decoding="async"
//           src="https://payherestorage.blob.core.windows.net/payhere-resources/plugins/payhere_long_banner.png"
//           className="pb-2"
//           style={{ color: "transparent" }}
//         />
//       </div>
//     </>
//   );
// };

// export default PayHerePayment;
