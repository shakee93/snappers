"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { GET_PAYMENT_GATEWAYS, UPDATE_SHIPPING_TOTAL, } from "@/graphql/defs/cart";
import { CHECKOUT, COMPLETE_ORDER_PAYMENT, GUEST_CHECKOUT, GUEST_CHECKOUT_MUTATION } from "@/graphql/defs/order";
import { CheckoutPayload, PaymentGateway } from "@/graphql/types/graphql";

import CheckoutDetails from "./CheckoutDetails";
import CartItems from "./CartItems";
import toast from "react-hot-toast";
import { PaymentDetailsWithoutUrls } from "@/data/types";
import Script from "next/script";
import { usePayhere } from "../components/Payment/Payhere";
import { useRouter } from "next/navigation";
import PaymentModal from "@/app/components/Payment/PaymentModal";
import { useSession } from "@/context/SessionProvider";

interface FormData {
    contactInfo: Record<string, any>;
    deliveryAddress: Record<string, any>;
    billingAddress: Record<string, any>;
    paymentMethod: {
        selectedGateway?: {
            id?: string;
        };
    };
}
//
// const FAKE_PAYMENT_DETAILS: PaymentDetailsWithoutUrls | null = {
//     order_id: "6425",
//     items: JSON.stringify([
//         {
//             databaseId: 485,
//             subtotal: "39500",
//             quantity: 1,
//             product: {
//                 node: {
//                     name: "Xiaomi Redmi 10 (2022) | 6GB 128GB",
//                     databaseId: 6337,
//                     featuredImage: {
//                         node: {
//                             sourceUrl:
//                                 "https://gq.freshpixl.com/wp-content/uploads/2023/12/REDMI-10-GREY.jpg",
//                             __typename: "MediaItem",
//                         },
//                         __typename: "NodeWithFeaturedImageToMediaItemConnectionEdge",
//                     },
//                     __typename: "SimpleProduct",
//                 },
//                 __typename: "LineItemToProductConnectionEdge",
//             },
//             __typename: "LineItem",
//         },
//     ]),
//     // subtotal: "රු39,500.00",
//     amount: "රු39,500.00",
//     currency: "LKR",
//     first_name: "Shakeeb",
//     last_name: "Sadikeen",
//     email: "shadeersadikeen@gmail.com",
//     phone: "+94755040038",
//     address: "120/21/5B, Araliya Uyana, Megoda Kolonnawa",
//     // address: "araliya uyana, megoda kolonnawa",
//     // billingAddress2: "120/21/5b",
//     city: "Colombo",
//     country: "Sri Lanka",
// };

// const FAKE_CHECKOUT_DETAILS: any = {
//     "checkout": {
//         "clientMutationId": null,
//         "redirect": "https://gq.freshpixl.com/checkout/order-received/6553/?key=wc_order_7pKYJMGpe5HOf",
//         "result": "success",
//         "customer": {
//             "displayName": "shadeer",
//             "shipping": {
//                 "firstName": "Shakeeb",
//                 "lastName": "Sadikeen",
//                 "address1": "120/21/5B, Araliya Uyana, Megoda Kolonnawa",
//                 "address2": "Wellampitiya",
//                 "city": "Colombo",
//                 "country": "LK",
//                 "state": null,
//                 "postcode": "10600",
//                 "phone": "+94755040038",
//                 "email": null,
//                 "__typename": "CustomerAddress"
//             },
//             "billing": {
//                 "firstName": "Shakeeb",
//                 "lastName": "sadikeen",
//                 "address1": "araliya uyana, megoda kolonnawa",
//                 "address2": "120/21/5b",
//                 "city": "wellampitiya , colombo",
//                 "country": "LK",
//                 "state": null,
//                 "postcode": "00800",
//                 "phone": "+94750278330",
//                 "email": "shakee.zats@gmail.com",
//                 "__typename": "CustomerAddress"
//             },
//             "email": "shadeersadikeen@gmail.com",
//             "__typename": "Customer"
//         },
//         "order": {
//             "total": "රු11,900.00",
//             "__typename": "Order"
//         },
//         "__typename": "CheckoutPayload"
//     }
// }

const CheckoutPage = () => {
    const { cart, removeFromCart, updateCart } = useCart();
    const { customer, fetchCustomer, } = useSession();

    const { data } = useQuery(GET_PAYMENT_GATEWAYS);
    const paymentGateways: PaymentGateway[] = data?.paymentGateways.nodes;
    const [tabActive, setTabActive] = useState<
        | "ContactInfo"
        | "DeliveryAddress"
        | "BillingAddress"
        | "PaymentMethod"
        | "order-cart"
    >("ContactInfo");
    const [formData, setFormData] = useState<FormData>({
        contactInfo: {},
        deliveryAddress: {},
        billingAddress: {},
        paymentMethod: {
            selectedGateway: {},
        },
    });
    const [isStorePickup, setIsStorePickup] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState({
        contactInfo: false,
        deliveryAddress: false,
        paymentMethod: false,
        billingAddress: false,
    });

    const [shippingTotal, setShippingTotal] = useState();
    const [orderTotal, setOrderTotal] = useState();
    const [paymentData, setPaymentData] =
        useState<PaymentDetailsWithoutUrls | null>(null)
    const [showBankTransfer, setShowBankTransfer] = useState<boolean>(false)
    const [wantToSHowBankTransfer, setWantToSHowBankTransfer] = useState(false)

    // USE_CASE:  This is to redirect to home page if cart is empty
    // useEffect(() => {
    //   if (cart && cart?.contents?.nodes?.length === 0) {
    //     router.push("/");
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [cart]);

    useEffect(() => {
        fetchCustomer()
    }, []);

    const updateFormData = (section: string, data: any) => {
        setFormData((prevData) => {
            let updatedSection;

            if (data === null || data === undefined) {
                updatedSection = {};
            } else {
                updatedSection = {
                    ...prevData[section as keyof FormData],
                    ...data,
                };
            }

            return {
                ...prevData,
                [section as keyof FormData]: updatedSection,
            };
        });
    };

    const handleConfirmationChange = (component: string, value: boolean) => {
        setIsConfirmed((prevConfirmed) => {
            // console.log("Updated Confirmation Values:", updatedConfirmed);

            return {
                ...prevConfirmed,
                [component]: value,
            };
        });
    };

    const [
        updateCartShippingTotalMutation
    ] = useMutation(UPDATE_SHIPPING_TOTAL);
    const [
        checkoutMutation,
        {
            // data: realCheckoutData,
        },
    ] = useMutation(CHECKOUT);

    const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);

    const completePaymentMutationHandle = async () => {
        const { data } = await completeOrderPayment({
            variables: { orderId: 10, status: "COMPLETED" },
        });
        console.log("data on the complete order Mutation: ", data);
        return data;
    }


    const updateShippingTotal = async () => {
        try {
            const shippingMethods = isStorePickup ? "pickup_location:0" : "wbs:0dd3bc79_weight_based_shipping";
            const { data } = await updateCartShippingTotalMutation({
                variables: { input: { shippingMethods } },
            });

            if (data?.updateShippingMethod?.cart) {
                const { total, shippingTotal } = data.updateShippingMethod.cart;
                setOrderTotal(total);
                setShippingTotal(shippingTotal);
                // console.log("Cart shipping total updated successfully");
            } else {
                console.error("Failed to update cart shipping total. No valid data returned.");
            }
        } catch (error) {
            console.error("An error occurred while updating shipping total:", error);
        }
    };

    useEffect(() => {
        updateShippingTotal().then(r => r);
    }, [isStorePickup, updateCartShippingTotalMutation]);

    // const [
    //     guestCheckoutMutation,
    //     {loading: checkoutLoading, error: checkoutError, data: checkoutData},
    // ] = useMutation(GUEST_CHECKOUT_MUTATION);

    const paymentDetails = useMemo(() => {
        return paymentData
    }, [paymentData]);

    const initiatePayment = usePayhere();

    const ImplementPayhere = (paymentDetails: any) => {
        if (initiatePayment !== null) {
            initiatePayment(paymentDetails).then(r => r);
        } else {
            console.log("initiate payment become null");
        }
    };

    const savePaymentDetails = (checkoutDetails: any): PaymentDetailsWithoutUrls => {
        let orderDetails: CheckoutPayload = checkoutDetails?.checkout
        let { order, customer } = orderDetails

        let saved_data = {
            amount: order?.total ?? "no_amount",
            items: "Mobile Items",
            order_id: order?.databaseId?.toString() ?? "no_order_id_found",
            first_name: customer?.billing?.firstName || "no_lastname",
            last_name: customer?.billing?.lastName || "no firstname",
            email: customer?.email || "no_email",
            address: customer?.billing?.address1 || "no_address",
        }

        console.log("saved data: ", saved_data)
        return saved_data
    }

    function ImplementBankTransfer() {
        setWantToSHowBankTransfer(false)
        setShowBankTransfer(true)
    }

    // Creating a Order using For Guest. Instead of using direct checkout mutation.
    const [createOrderGuest] = useMutation(GUEST_CHECKOUT_MUTATION)
    const [guestCheckout] = useMutation(GUEST_CHECKOUT)

    const CreateOrderGuest = async () => {
        const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;

        const shipping = [
            {
                methodId: shippingTotal === "රු0.00" ? "pickup_location:0" : "wbs:0dd3bc79_weight_based_shipping",
                methodTitle: shippingTotal === "0.00" ? "pickup_location:0" : "Weight Based Shipping",
                total: shippingTotal,
            },
        ];

        const lineItems =
            cart?.contents?.nodes.map((item) => ({
                productId: item?.product?.node?.databaseId,
                quantity: item?.quantity,
            })) || [];

        if (customer?.id == "guest") {
            // For Create Order Mutation
            const createOrderKeys = {
                paymentMethod: paymentMethodId,
                shippingMethod: shipping[0].methodId,
                lineItems: lineItems
            };

            // Using Real mutation without Output the order key and the order id.
            const guestCheckoutKeys = {
                input: {
                    paymentMethod: paymentMethodId,
                    shippingMethod: shipping[0].methodId,
                },
            };

            const { data } = await guestCheckout({ variables: guestCheckoutKeys });
            if (data) {
                toast.success("Order created successfully for you! (GUEST) ")
            }
        } else {
            alert("You are already logged in")
        }

    }

    useEffect(() => {
        if (!paymentDetails) {
            console.log("payment data not initiated yet!");
            return;
        }

        const isBankTransfer = formData?.paymentMethod?.selectedGateway?.id == "bacs"
        const isPayhere = formData?.paymentMethod?.selectedGateway?.id == "payhere"
        const isCashOnDelivery = formData?.paymentMethod?.selectedGateway?.id == "cod"

        let checkoutDetails = paymentDetails;

        if (isPayhere) {
            try {
                ImplementPayhere(checkoutDetails);
            } catch (e) {
                console.log("Error while creating Payhere:", e);
            }
        }

        if (isBankTransfer) {
            try {
                ImplementBankTransfer();
            } catch (e) {
                console.log("Error while creating BankTransfer:", e);
                toast.error("Error on BankTransfer");
            }
        }

        if (isCashOnDelivery) {
            let redirectUrl = `checkout/${checkoutDetails.order_id}`
            router.push(redirectUrl);
        }

    }, [paymentData]);

    const router = useRouter();

    function handlePaymentMethod(checkoutDetails: any) {


    }

    const handleCheckout = async () => {
        // Checkout for Guest.
        if (customer?.id == "guest") {
            await CreateOrderGuest()
            return
        }

        try {
            const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;
            if (wantToSHowBankTransfer) {
                ImplementBankTransfer()
                return
            }

            const shipping = [
                {
                    methodId: shippingTotal === "රු0.00" ? "pickup_location:0" : "wbs:0dd3bc79_weight_based_shipping",
                    methodTitle: shippingTotal === "0.00" ? "pickup_location:0" : "Weight Based Shipping",
                    total: shippingTotal,
                },
            ];

            if (paymentMethodId !== undefined) {
                const obj = {
                    input: {
                        paymentMethod: paymentMethodId,
                        shippingMethod: shipping[0].methodId,
                    },
                };

                const { data } = await checkoutMutation({ variables: obj });

                if (data) {
                    const checkoutDetails: PaymentDetailsWithoutUrls = savePaymentDetails(data);
                    setPaymentData(checkoutDetails);
                    handlePaymentMethod(checkoutDetails)
                    toast.success("Order Created Successfully");
                } else {
                    toast.error("Something Went Wrong While Checkout");
                }
            } else {
                console.error("Payment method ID is undefined");
            }
        } catch (error: any) {
            if (error.message == "Sorry, no session found.") {
                toast.error("No Items to checkout")
                return;
            }
            toast.error("Failed to create the order" + error.message);
        }
    };


    const handleScrollToEl = (id: string) => {
        const element = document.getElementById(id);
        setTimeout(() => {
            element?.scrollIntoView({ behavior: "smooth" });
        }, 80);
    };

    return (
        <div className="nc-CheckoutPage">
            <Script
                type="text/javascript"
                src={"https://www.payhere.lk/lib/payhere.js"}
                onLoad={() => console.log("PayHere script loaded")}
                onError={() => console.error("Error loading PayHere script")}
            />
            <title>Checkout</title>
            <main className="container py-8 md:py-16 lg:pb-28 lg:pt-20 ">
                <PaymentModal show={showBankTransfer} setShowBankTransfer={setShowBankTransfer}
                    setWantToSHowBankTransfer={setWantToSHowBankTransfer}
                    paymentDetails={paymentDetails} />
                <div className="mb-16">
                    <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
                        Checkout
                    </h2>
                    <div
                        className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
                        <Link href={"/#"} className="">
                            Homepage
                        </Link>
                        {/* <span className="text-xs mx-1 sm:mx-1.5">/</span> */}
                        {/* <Link href={"/#"} className="">
                            Clothing Categories
                        </Link> */}
                        <span className="text-xs mx-1 sm:mx-1.5">/</span>
                        <span className="underline">Checkout</span>
                    </div>
                </div>
                {" "}
                .
                <div className="flex flex-col lg:flex-row">
                    {/* Information about user */}
                    <div className="flex-1">
                        <CheckoutDetails
                            tabActive={tabActive}
                            setTabActive={(
                                value:
                                    | "ContactInfo"
                                    | "BillingAddress"
                                    | "DeliveryAddress"
                                    | "PaymentMethod"
                                    | "order-cart"
                            ) => setTabActive(value)}
                            handleScrollToEl={handleScrollToEl}
                            updateFormData={updateFormData}
                            formData={formData}
                            paymentGateways={paymentGateways}
                            handleConfirmationChange={handleConfirmationChange}
                            setIsStorePickup={setIsStorePickup}
                            isStorePickup={isStorePickup}
                        />
                    </div>

                    <div
                        className="flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:lg:mx-14 2xl:mx-16 "></div>

                    <div id="order-cart" className="w-full lg:w-[36%] ">
                        <h3 className="text-lg font-semibold">Order summary</h3>
                        <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
                            {cart?.contents?.nodes.map((item, index) => (
                                <CartItems
                                    index={index}
                                    key={index}
                                    item={item as any}
                                    onQuantityChange={updateCart}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </div>

                        <div
                            className="mt-10 pt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-700 ">
                            {/* <div>
                                <Label className="text-sm">Discount code</Label>
                                <div className="flex mt-1.5">
                                    <Input sizeClass="h-10 px-4 py-3" className="flex-1" />
                                        Apply
                                    </button>
                                </div>
                            </div> */}

                            <div className="mt-4 flex justify-between py-2.5">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {cart?.subtotal || "රු0.00"}
                                </span>
                            </div>

                            {!isStorePickup && (
                                <div className="flex justify-between py-2.5">
                                    <span>Shipping estimate</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                                        {cart?.shippingTotal || "රු0.00"}
                                    </span>
                                </div>
                            )}

                            {/* <div className="flex justify-between py-2.5">
                                <span>Tax estimate</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {cart?.totalTax || "$0.00"}
                                </span>
                            </div> */}
                            <div
                                className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
                                <span>Order total</span>
                                {/* <span>{cart?.total || "$0.00"}</span> */}
                                <span>{orderTotal || "රු0.00"}</span>
                            </div>
                        </div>

                        <ButtonPrimary
                            onClick={handleCheckout}
                            disabled={
                                !(
                                    isConfirmed.contactInfo &&
                                    isConfirmed.deliveryAddress &&
                                    isConfirmed.billingAddress &&
                                    isConfirmed.paymentMethod
                                )
                            }
                            className={`mt-8 w-full ${!(
                                    isConfirmed.contactInfo &&
                                    isConfirmed.deliveryAddress &&
                                    isConfirmed.billingAddress &&
                                    isConfirmed.paymentMethod
                                )
                                    ? "bg-slate-500 cursor-not-allowed"
                                    : "bg-primary hover:bg-primary-dark"
                                }`}
                        >
                            Confirm order
                        </ButtonPrimary>
                        {/*<ButtonPrimary onClick={CreateOrderGuest}>*/}
                        {/*    GUEST CHECKOUT*/}
                        {/*</ButtonPrimary>*/}

                        {/*<ButtonPrimary onClick={ImplementPayhere}>*/}
                        {/*    Confirm Order With Payhere*/}
                        {/*</ButtonPrimary>*/}
                        {/*<ButtonPrimary onClick={ImplementBankTransfer}>*/}
                        {/*    Do your Bank Transfer*/}
                        {/*</ButtonPrimary>*/}

                        <div
                            className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
                            <p className="block relative pl-5">
                                <svg
                                    className="w-4 h-4 absolute -left-1 top-0.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 8V13"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M11.9945 16H12.0035"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                By proceeding with your purchase you agree to our{" "}
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={"/terms-and-conditions"}
                                    className="text-slate-900 dark:text-slate-200 underline font-medium"
                                >
                                    Terms and Conditions
                                </Link>
                                <span>
                                    {` `}and{` `}
                                </span>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={"/privacy"}
                                    className="text-slate-900 dark:text-slate-200 underline font-medium"
                                >
                                    Privacy Policy
                                </Link>
                                {` `}.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;
