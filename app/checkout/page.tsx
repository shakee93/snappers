"use client"

import Label from "components/Label/Label";
import NcInputNumber from "components/NcInputNumber";
import Prices from "components/Prices";
import { Product, PRODUCTS } from "data/data";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Image from "next/image";
import { useMutation } from '@apollo/client';

import ButtonPrimary from "shared/Button/ButtonPrimary";
import Input from "shared/Input/Input";
import ContactInfo from "./ContactInfo";
import PaymentMethod from "./PaymentMethod";
import ShippingAddress from "./ShippingAddress";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { useQuery } from "@apollo/client";
import { GET_PAYMENT_GATEWAYS } from "@/graphql/defs/cart";
import { GET_CUSTOMER_INFO, CHECKOUT_MUTATION } from "@/graphql/defs/order";

import CheckoutDetails from "./CheckoutDetails";
import CartItems from "./CartItems";


export interface CartInfo {
    appliedCoupons: null;
    availableShippingMethods: {}[];
    contents: {
        itemCount: number;
        nodes: CartItem[];
        __typename: string;
    };
    discountTax: string;
    discountTotal: string;
    feeTax: string;
    feeTotal: string;
    needsShippingAddress: boolean;
    shippingTax: string;
    shippingTotal: string;
    subtotal: string;
    subtotalTax: string;
    total: string;
    totalTax: string;
}

export interface CartItem {
    extraData: any[];
    key: string;
    product: CartItemProduct;
    quantity: number;
    subtotal: string;
    subtotalTax: string;
    total: string;
    variation: null | any;
}

export interface CartItemProduct {
    node: CartItemProductNode;
}

export interface CartItemProductNode {
    id: number;
    name: string;
    price: number;
    image: string;
    terms: string[];
}

interface SelectedGateway {
    id: string;
    title: string;
}

interface FormData {
    contactInfo: Record<string, any>;
    shippingAddress: Record<string, any>;
    paymentMethod: {
        selectedGateway?: {
            id: string;
        };
    };
}

const CheckoutPage = () => {

    const { cart, removeFromCart, updateCart } = useCart();
    console.log({ cart })

    const { loading, error, data, refetch } = useQuery(GET_PAYMENT_GATEWAYS);

    const paymentGateways = data?.paymentGateways.nodes;

    const [tabActive, setTabActive] = useState<
        "ContactInfo" | "ShippingAddress" | "PaymentMethod"
    >("ShippingAddress");

    const [formData, setFormData] = useState<FormData>({
        contactInfo: {},
        shippingAddress: {},
        paymentMethod: {},
    });

    const updateFormData = (section: string, data: any) => {
        console.log('Incoming data:', data);

        setFormData((prevData) => {
            let updatedData;

            if (section.toLowerCase() === 'shippingaddress') {
                updatedData = {
                    ...prevData,
                    shippingAddress: {
                        ...prevData.shippingAddress,
                        ...data,
                    },
                };
            } else if (section.toLowerCase() === 'contactinfo') {
                updatedData = {
                    ...prevData,
                    contactInfo: {
                        ...prevData.contactInfo,
                        ...data,
                    },
                };
            } else {
                updatedData = {
                    ...prevData,
                    [section]: {
                        ...(prevData as Record<string, any>)[section] || {},
                        ...data,
                    },
                };
            }

            return updatedData;
        });
    };


    console.log({ formData })

    const [checkoutMutation, { loading: checkoutLoading, error: checkoutError, data: checkoutData }] = useMutation(CHECKOUT_MUTATION);

    const handleCheckout = async () => {
        try {
            const paymentMethodId = formData?.paymentMethod?.selectedGateway.id;

            if (paymentMethodId !== undefined) {
                const { data } = await checkoutMutation({
                    variables: { paymentMethod: paymentMethodId },
                });
            } else {
                console.error("Payment method ID is undefined");
            }

            console.log('data inside mutation', checkoutData)

            const orderDetails = data.checkout.order;
            console.log("Order Details:", orderDetails);

        } catch (error) {
            console.error("Checkout failed:", error);
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
            {/* <Helmet> */}
            <title>Checkout</title>
            {/* </Helmet> */}

            <main className="container py-16 lg:pb-28 lg:pt-20 ">
                <div className="mb-16">
                    <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
                        Checkout
                    </h2>
                    <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
                        <Link href={"/#"} className="">
                            Homepage
                        </Link>
                        <span className="text-xs mx-1 sm:mx-1.5">/</span>
                        <Link href={"/#"} className="">
                            Clothing Categories
                        </Link>
                        <span className="text-xs mx-1 sm:mx-1.5">/</span>
                        <span className="underline">Checkout</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1">
                        <CheckoutDetails
                            tabActive={tabActive}
                            setTabActive={(value: "ContactInfo" | "ShippingAddress" | "PaymentMethod") => setTabActive(value)}
                            handleScrollToEl={handleScrollToEl}
                            updateFormData={updateFormData}
                            paymentGateways={paymentGateways}
                        />
                    </div>

                    <div className="flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:lg:mx-14 2xl:mx-16 "></div>

                    <div className="w-full lg:w-[36%] ">
                        <h3 className="text-lg font-semibold">Order summary</h3>
                        <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
                            {cart?.contents?.nodes.map((item, index) => (
                                <CartItems key={index} item={item} onQuantityChange={updateCart} onRemove={removeFromCart} />
                            ))}
                        </div>

                        <div className="mt-10 pt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-700 ">
                            <div>
                                <Label className="text-sm">Discount code</Label>
                                <div className="flex mt-1.5">
                                    <Input sizeClass="h-10 px-4 py-3" className="flex-1" />
                                    <button className="text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 rounded-2xl px-4 ml-3 font-medium text-sm bg-neutral-200/70 dark:bg-neutral-700 dark:hover:bg-neutral-800 w-24 flex justify-center items-center transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between py-2.5">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {cart?.subtotal || "$0.00"}
                                </span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span>Shipping estimate</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {cart?.shippingTotal || "$0.00"}
                                </span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span>Tax estimate</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {cart?.totalTax || "$0.00"}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
                                <span>Order total</span>
                                <span>{cart?.total || "$0.00"}</span>
                            </div>
                        </div>
                        <ButtonPrimary onClick={handleCheckout} className="mt-8 w-full">
                            Confirm order
                        </ButtonPrimary>
                        <div className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
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
                                Learn more{` `}
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="/terms"
                                    className="text-slate-900 dark:text-slate-200 underline font-medium"
                                >
                                    Taxes
                                </Link>
                                <span>
                                    {` `}and{` `}
                                </span>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="/terms"
                                    className="text-slate-900 dark:text-slate-200 underline font-medium"
                                >
                                    Shipping
                                </Link>
                                {` `} infomation
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;
