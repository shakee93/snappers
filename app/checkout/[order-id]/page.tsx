/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import {OrderPaymentPageProps, PaymentDetailsWithoutUrls} from "@/data/types";
import {useLazyQuery, useQuery} from "@apollo/client";
import {GET_CHECKOUT_USER_DETAILS, GET_SINGLE_ORDER,} from "@/graphql/defs/order";
import {useEffect, useMemo} from "react";
import ProductTable, {OrderDetails} from "./Comps";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrderPaymentPage({params}: OrderPaymentPageProps) {
    const orderId = params["order-id"];

    if (orderId == "ItemNo12345") {
        return (
            <div className={`container mx-auto grid items-center justify-center `}>
                <h1 className={`text-2xl font-bold  py-20 text-center `}>📝 The page is unable to load
                    the
                    order ID since it{"'"}s a Payhere testing ID.</h1>
                <Link className={`text-center self-center text-blue-500 font-bold underline hover:cursor-pointer hover:text-blue-800 `} href={`/`}>Back to Home</Link>
            </div>

        )
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [getUserData, {data: customerData}] = useLazyQuery(
        GET_CHECKOUT_USER_DETAILS,
        {fetchPolicy: "no-cache"}
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {data: orderData, error: orderError} = useQuery(GET_SINGLE_ORDER, {
        variables: {orderID: orderId},
    });

    useEffect(() => {
        getUserData().then(r => r);
    }, [getUserData]);

    // console.log("+++++++++++++++++++++++++++++++")
    // console.log({orderData})
    // console.log({customerData})
    // console.log({orderData})
    // console.log("Order Error", orderError)
    // console.log("+++++++++++++++++++++++++++++++")
    // console.log(`orderID: ${orderId}`);
    if (!orderId || orderId == "12345") {

        toast.error(`Order not found: ${orderId}`);
        // redirect('/');
    }

    console.log('Order Data', orderData);

    const temporaryPaymentDetails: PaymentDetailsWithoutUrls = useMemo(
        () => ({
            order_id: orderData?.order?.orderNumber ?? "",
            items: orderData?.order?.lineItems?.nodes ?? [],
            subtotal: orderData?.order?.subtotal,
            amount: orderData?.order?.total ?? "",
            currency: "LKR",
            first_name:
                customerData?.customer?.shipping?.firstName ?? "no_first_name",
            last_name: customerData?.customer?.shipping?.lastName ?? "no_last_name",
            email: customerData?.customer?.email ?? "no_email",
            phone: customerData?.customer?.shipping?.phone ?? "no_phone",
            address: customerData?.customer?.shipping?.address2 ?? "no_address",
            billingAddress: customerData?.customer?.billing?.address1 ?? "no_address",
            billingAddress2: customerData?.customer?.billing?.address2 ?? "no_address",
            city: customerData?.customer?.shipping?.city ?? "no_city",
            country: "Sri Lanka",
        }),
        [orderData, customerData]
    );

    // console.log({temporaryPaymentDetails})
    // if(!orderData?.order){
    //   return <OrderPaymentPageSkeleton/>
    // }

    console.log('paymentDetails', temporaryPaymentDetails);

    return (
        <div className="container mx-auto rounded-3xl lg:p-20 text-center ">
            <div className="my-4 ">
                <OrderDetails orderData={orderData}/>

                <div className="">
                    <div className="">

                        <ProductTable lineItems={orderData?.order?.lineItems?.nodes} orderData={orderData}
                                      paymentDetails={temporaryPaymentDetails}/>

                        {/* {data?.order.paymentMethod === "payhere" ? <PayHerePayment/> : "Continue with Bank Transfer"} */}
                        {/* && data?.order.paymentMethod === "payhere" && */}
                        {/*{temporaryPaymentDetails && (*/}
                        {/*  < paymentDetails={temporaryPaymentDetails} />*/}
                        {/*)}*/}
                        {/*<BankTransfer paymentDetails={temporaryPaymentDetails}/>*/}
                    </div>
                </div>

            </div>
        </div>
    );
}
