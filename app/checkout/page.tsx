"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { useQuery } from "@apollo/client";
import {
  GET_PAYMENT_GATEWAYS,
  UPDATE_SHIPPING_TOTAL,
} from "@/graphql/defs/cart";
import { CHECKOUT, GUEST_CHECKOUT_MUTATION } from "@/graphql/defs/order";
import { PaymentGateway } from "@/graphql/types/graphql";

import CheckoutDetails from "./CheckoutDetails";
import CartItems from "./CartItems";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ModalPayhere from "../components/Payment/PaymentModal";
import PaymentModal from "../components/Payment/PaymentModal";

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

const FAKE_PAYMENT_DETAILS = {
  order_id: "6445",
  items: [
    {
      databaseId: 485,
      subtotal: "39500",
      quantity: 1,
      product: {
        node: {
          name: "Xiaomi Redmi 10 (2022) | 6GB 128GB",
          databaseId: 6337,
          featuredImage: {
            node: {
              sourceUrl:
                "https://gq.freshpixl.com/wp-content/uploads/2023/12/REDMI-10-GREY.jpg",
              __typename: "MediaItem",
            },
            __typename: "NodeWithFeaturedImageToMediaItemConnectionEdge",
          },
          __typename: "SimpleProduct",
        },
        __typename: "LineItemToProductConnectionEdge",
      },
      __typename: "LineItem",
    },
  ],
  subtotal: "රු39,500.00",
  amount: "රු39,500.00",
  currency: "LKR",
  first_name: "Shakeeb",
  last_name: "Sadikeen",
  email: "shadeersadikeen@gmail.com",
  phone: "+94755040038",
  address: "120/21/5B, Araliya Uyana, Megoda Kolonnawa",
  billingAddress: "araliya uyana, megoda kolonnawa",
  billingAddress2: "120/21/5b",
  city: "Colombo",
  country: "Sri Lanka",
};

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, removeFromCart, updateCart } = useCart();
  const { loading, error, data, refetch } = useQuery(GET_PAYMENT_GATEWAYS);
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

  const [paymentInitialized, setPaymentInitialized] = useState(false);

  // useEffect(() => {
  //   if (cart && cart?.contents?.nodes?.length === 0) {
  //     router.push("/");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [cart]);

  useEffect(() => { }, [formData]);

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

      const updatedFormData = {
        ...prevData,
        [section as keyof FormData]: updatedSection,
      };

      return updatedFormData;
    });
  };

  const handleConfirmationChange = (component: string, value: boolean) => {
    setIsConfirmed((prevConfirmed) => {
      const updatedConfirmed = {
        ...prevConfirmed,
        [component]: value,
      };

      // console.log("Updated Confirmation Values:", updatedConfirmed);

      return updatedConfirmed;
    });
  };

  const [
    updateCartShippingTotalMutation,
    {
      loading: updateCartShippingTotalLoading,
      error: updateCartShippingTotalError,
      data: updateCartShippingTotalData,
    },
  ] = useMutation(UPDATE_SHIPPING_TOTAL);

  const [shippingTotal, setShippingTotal] = useState();
  const [orderTotal, setOrderTotal] = useState();

  useEffect(() => {
    const updateShippingTotal = async () => {
      try {
        let shippingMethods;

        if (isStorePickup) {
          shippingMethods = "pickup_location:0";
        } else {
          shippingMethods = "wbs:0dd3bc79_weight_based_shipping";
        }

        const { data } = await updateCartShippingTotalMutation({
          variables: {
            input: { shippingMethods },
          },
        });

        setOrderTotal(data?.updateShippingMethod?.cart?.total);
        setShippingTotal(data?.updateShippingMethod?.cart?.shippingTotal);

        if (data) {
          console.log("Cart shipping total updated successfully");
        } else {
          console.error("Failed to update cart shipping total");
        }
      } catch (error: any) {
        console.log("Error:", error);
      }
    };

    updateShippingTotal();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorePickup, updateCartShippingTotalMutation ]);

  const [
    guestCheckoutMutation,
    { loading: checkoutLoading, error: checkoutError, data: checkoutData },
  ] = useMutation(GUEST_CHECKOUT_MUTATION);

  const [
    checkoutMutation,
    {
      loading: realCheckoutLoading,
      error: realCheckoutError,
      data: realCheckoutData,
    },
  ] = useMutation(CHECKOUT);

  useEffect(() => {
    console.log("checkout returned data: ", checkoutData);
  }, [checkoutData]);

  checkoutError && console.log("checkout error: ", checkoutError);

  const handleCheckout = async () => {
    try {
      const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;

      const lineItems =
        cart?.contents?.nodes.map((item) => ({
          productId: item?.product?.node?.databaseId,
          quantity: item?.quantity,
        })) || [];

      
      const shipping = [
        {
          methodId:
            shippingTotal === "රු0.00"
              ? "pickup_location:0"
              : "wbs:0dd3bc79_weight_based_shipping",
          methodTitle:
            shippingTotal === "0.00" ? "pickup_location:0" : "Weight Based Shipping",
          total: shippingTotal,
        },
      ];

      if (paymentMethodId !== undefined) {
        let obj = {
          input: {
            paymentMethod: paymentMethodId,
            shippingMethod: shipping[0].methodId,
          },
        };

        console.log("obj: ", FAKE_PAYMENT_DETAILS);

        try {
          const { data } = await checkoutMutation({
            variables: obj,
          });
          console.log("checkout data: ", data);
          toast.success("Order Created Succussfully");
        } catch (error: any) {
          console.log("Error:", error);
          toast.error("Failed to the create order");
        }
      } else {
        console.error("Payment method ID is undefined");
      }
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
      <title>Checkout</title>

      <main className="container py-8 md:py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-16">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Checkout
          </h2>
          <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
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
        </div>{" "}
        .
        <div className="flex flex-col lg:flex-row">
          {/* Informations about user */}
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

          <div className="flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:lg:mx-14 2xl:mx-16 "></div>

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

            <div className="mt-10 pt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-700 ">
              {/* <div>
                                <Label className="text-sm">Discount code</Label>
                                <div className="flex mt-1.5">
                                    <Input sizeClass="h-10 px-4 py-3" className="flex-1" />
                                    <button className="text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 rounded-2xl px-4 ml-3 font-medium text-sm bg-neutral-200/70 dark:bg-neutral-700 dark:hover:bg-neutral-800 w-24 flex justify-center items-center transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div> */}

              <div className="mt-4 flex justify-between py-2.5">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {cart?.subtotal || "$0.00"}
                </span>
              </div>

              {!isStorePickup && (
                <div className="flex justify-between py-2.5">
                  <span>Shipping estimate</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {cart?.shippingTotal || "$0.00"}
                  </span>
                </div>
              )}

              {/* <div className="flex justify-between py-2.5">
                                <span>Tax estimate</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {cart?.totalTax || "$0.00"}
                                </span>
                            </div> */}
              <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
                <span>Order total</span>
                {/* <span>{cart?.total || "$0.00"}</span> */}
                <span>{orderTotal || "$0.00"}</span>
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
            <PaymentModal show={true} paymentDetails={FAKE_PAYMENT_DETAILS} />

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
                By proceeding with your purchase you agree to our{" "}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="/terms-and-conditions"
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
                  href="/privacy"
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
