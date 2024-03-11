/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FetchResult, useMutation, useQuery } from "@apollo/client";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import {
  GET_PAYMENT_GATEWAYS,
  UPDATE_SHIPPING_TOTAL,
  UPDATE_CART_FEE
} from "@/graphql/defs/cart";
import {
  CHECKOUT,
  COMPLETE_ORDER_PAYMENT,
  GUEST_CHECKOUT,
  GUEST_CHECKOUT_MUTATION,
} from "@/graphql/defs/order";
import {
  CheckoutPayload,
  CustomerAddressInput,
  PaymentGateway,
} from "@/graphql/types/graphql";

import CheckoutDetails from "./CheckoutDetails";
import CartItems from "./CartItems";
import toast from "react-hot-toast";
import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import Script from "next/script";
import { usePayhere } from "../components/Payment/Payhere";
import { useRouter } from "next/navigation";
import PaymentModal from "@/app/components/Payment/PaymentModal";
import { useSession } from "@/context/SessionProvider";
import { Info, Loader } from "lucide-react";
import {
  savePaymentDetails,
  transformAddress,
} from "@/components/AddressPageComps/HelperComps";
import { useStats } from "react-instantsearch";

interface FormData {
  contactInfo: Record<string, any>;
  deliveryAddress: any;
  billingAddress: any;
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

  const [finalOrderTotal, setFinalOrderTotal] = useState(null);

  const { customer, fetchCustomer } = useSession();

  const { data } = useQuery(GET_PAYMENT_GATEWAYS);
  const paymentGateways: PaymentGateway[] = data?.paymentGateways?.nodes;
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
  // create state for the payhere random id
  const [payherPaymentID, setPayherPaymentID] = useState<string | null>(null)


  const [payhereHandleStatus, setPayhereHandleStatus] =
    useState<PayhereStatus>("idle");

  const [isStorePickup, setIsStorePickup] = useState(false);
  const [isCardPayment, setIsCardPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState({
    contactInfo: false,
    deliveryAddress: false,
    paymentMethod: false,
    billingAddress: false,
  });


  const [shippingTotal, setShippingTotal] = useState();
  const [orderTotal, setOrderTotal] = useState();
  const [paymentData, setPaymentData] =
    useState<PaymentDetailsWithoutUrls | null>(null);
  const [showBankTransfer, setShowBankTransfer] = useState<boolean>(false);
  const [wantToSHowBankTransfer, setWantToSHowBankTransfer] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  // TODO: Un comment this for the redirect on cart free
  useEffect(() => {
    if (cart && cart?.contents?.nodes?.length === 0) {
      router.push("/");
    }
  }, [cart]);

  useEffect(() => {
    fetchCustomer();
  }, []);

  // MUTATIONS
  const [updateCartShippingTotalMutation] = useMutation(UPDATE_SHIPPING_TOTAL);
  const [checkoutMutation, {
    // data: realCheckoutData,
  },
  ] = useMutation(CHECKOUT);
  const [updateCartFee] = useMutation(UPDATE_CART_FEE);
  const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);
  // const  [createOrderGuest] = useMutation(GUEST_CHECKOUT_MUTATION)
  const [guestCheckout] = useMutation(GUEST_CHECKOUT);

  // Creating a Order using For Guest. Instead of using direct checkout mutation.
  const [
    createOrderGuest,
    { loading: checkoutLoading, error: checkoutError, data: checkoutData },
  ] = useMutation(GUEST_CHECKOUT_MUTATION);

  // Contexts
  const router = useRouter();
  const initiatePayment = usePayhere();

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
      return {
        ...prevConfirmed,
        [component]: value,
      };
    });
  };

  const implementCheckoutAfterPayhere = async () => {
    const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;
    if (paymentMethodId === undefined) {
      console.error("Payment method ID is undefined");
      toast.error("Payment Method was not chosen.");
      return;
    }

    const shippingMethod = getShippingMethod(shippingTotal);
    const shippingDetails = transformAddress(formData.deliveryAddress);
    const billingDetails = transformAddress(formData.billingAddress);

    if (payherPaymentID == null) {
      toast("payhere payment not initiated");
      return;
    }
    const variables = {
      input: {
        paymentMethod: paymentMethodId,
        shippingMethod,
        shipping: shippingDetails,
        billing: billingDetails,
        customerNote: `Payhere Payment ID: ${payherPaymentID} `,
      },
    };

    const { data } =
      customer?.id === "guest"
        ? await guestCheckout({ variables })
        : await checkoutMutation({ variables });

    if (data) {
      const checkoutDetails = savePaymentDetails(data);
      setPaymentData(checkoutDetails);
      let orderid = data?.checkout.order.databaseId
      toast.success("🌟 Order Placed Successfully! 🚀");
      router.push(`/checkout/${orderid}`);
    } else {
      toast.error("Something Went Wrong While Checkout");
    }
  }

  useEffect(() => {
    // let redirectUrl = `checkout/${checkoutDetails.order_id}`;

    // router.push(redirectUrl);
    switch (payhereHandleStatus) {
      case "finished":
        implementCheckoutAfterPayhere()
        setLoading(false);
        break;
      case "dismissed":
        // console.log("Dismissed Payhere.");
        setLoading(false)
        break;
      case "error":
        toast.error("error while initiate payment");
        break;

      default:
        break;
    }
  }, [payhereHandleStatus]);

  const updateShippingTotal = async () => {
    try {
      const shippingMethods = isStorePickup
        ? "pickup_location:0"
        : "wbs:0dd3bc79_weight_based_shipping";
      const total: any = cart?.total;
      setOrderTotal(total);

      // console.log('total in udpate shiipping', total);

      if (customer?.id === "guest") {
        const subtotal: any = cart?.subtotal;

        if (isStorePickup) {
          setOrderTotal(subtotal);
        } else {
          setOrderTotal(total);
        }
      }


      const { data, } = await updateCartShippingTotalMutation({
        variables: { input: { shippingMethods } },
      });


      console.log("data in shippng", data);

      if (data?.updateShippingMethod?.cart) {
        const { total, shippingTotal } = data.updateShippingMethod.cart;
        setOrderTotal(total);
        setShippingTotal(shippingTotal);
      } else {
        console.error(
          "Failed to update cart shipping total. No valid data returned."
        );
      }
    } catch (error) {
      console.error("An error occurred while updating shipping total:", error);
    }
  };

  useEffect(() => {
    updateShippingTotal().then((r) => r);
  }, [isStorePickup, updateCartShippingTotalMutation]);


  const paymentDetails = useMemo(() => {
    return paymentData;
  }, [paymentData]);

  const ImplementPayhere = () => {
    let generatedOrderId = crypto.randomUUID();
    setPayherPaymentID(generatedOrderId)

    let { firstName, lastName, city, apartment } =
      formData.billingAddress as any;

    let { email, phone } = formData.contactInfo;

    if (
      !orderTotal ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !apartment ||
      !city
    ) {
      toast.error("No order found");
      return;
    }

    let checkoutDetails: PaymentDetailsWithoutUrls = {
      amount: orderTotal,
      order_id: generatedOrderId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      items: "gq mobiles",
      address: city + apartment,
      city: city,
    };

    if (initiatePayment !== null) {
      setPayhereHandleStatus("loading");
      initiatePayment(checkoutDetails, setPayhereHandleStatus).then((r) => r);
    } else {
      // console.log("initiate payment become null");
    }
  };

  function ImplementBankTransfer() {
    setWantToSHowBankTransfer(false);
    setShowBankTransfer(true);
  }

  useEffect(() => {
    if (orderTotal) {
      console.log("Order Total: ", orderTotal)
    }
  }, [formData])


  useEffect(() => {
    if (!paymentDetails) {
      // console.log("payment data not initiated yet!");
      return;
    }

    const isBankTransfer =
      formData?.paymentMethod?.selectedGateway?.id == "bacs";
    // const isPayhere = formData?.paymentMethod?.selectedGateway?.id == "payhere";
    const isCashOnDelivery =
      formData?.paymentMethod?.selectedGateway?.id == "cod";

    let checkoutDetails = paymentDetails;

    // if (isPayhere) {
    //   try {
    //     ImplementPayhere(checkoutDetails);
    //     return;
    //   } catch (e) {
    //     console.log("Error while creating Payhere:", e);
    //   }
    // }

    if (isBankTransfer) {
      try {
        ImplementBankTransfer();
      } catch (e) {
        // console.log("Error while creating BankTransfer:", e);
        toast.error("Error on BankTransfer");
      }
    }

    if (isCashOnDelivery) {
      if (checkoutDetails.order_id == "no_order_id_found") {
        let email = formData?.contactInfo?.email;
        let redirectUrl = `/checkout/${checkoutDetails.order_id}?email=${email}`;
        router.push(redirectUrl);
        return;
      }

      let redirectUrl = `checkout/${checkoutDetails.order_id}`;

      router.push(redirectUrl);
    }
  }, [paymentData]);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      if (wantToSHowBankTransfer) {
        ImplementBankTransfer();
        return;
      }

      //Payhere integration for new

      const isPayhere =
        formData?.paymentMethod?.selectedGateway?.id == "payhere";

      if (isPayhere) {
        try {

          ImplementPayhere();
          setLoading(true)
          return;
        } catch (e) {
          console.log("Error while creating Payhere:", e);
        }
      }

      const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;
      if (paymentMethodId === undefined) {
        console.error("Payment method ID is undefined");
        toast.error("Payment Method was not chosen.");
        return;
      }

      formData.billingAddress.country = "SR";
      formData.deliveryAddress.country = "SR";

      const shippingMethod = getShippingMethod(shippingTotal);
      const shippingDetails = transformAddress(formData.deliveryAddress);
      const billingDetails = transformAddress(formData.billingAddress);

      const variables = {
        input: {
          paymentMethod: paymentMethodId,
          shippingMethod,
          shipping: shippingDetails,
          billing: billingDetails,
        },
      };

      const { data } =
        customer?.id === "guest"
          ? await guestCheckout({ variables })
          : await checkoutMutation({ variables });

      if (data) {
        const checkoutDetails = savePaymentDetails(data);
        setPaymentData(checkoutDetails);
        toast.success("🌟 Order Placed Successfully! 🚀");
      } else {
        toast.error("Something Went Wrong While Checkout");
      }
    } catch (error) {
      handleCheckoutError(error);
    } finally {
      setLoading(false);
    }
  };

  const getShippingMethod = (shippingTotal: any) => {
    const methodId =
      shippingTotal === "₨&nbsp;0.00"
        ? "pickup_location:0"
        : "wbs:0dd3bc79_weight_based_shipping";

    const methodTitle =
      shippingTotal === "₨&nbsp;0.00" ? "pickup_location:0" : "Weight Based Shipping";

    const total = shippingTotal;

    console.log("Shipping Method: ", { methodId, methodTitle, total });

    return { methodId, methodTitle, total };

  };

  const handleCheckoutError = (error: any) => {
    setLoading(false);
    if (error.message === "Sorry, no session found.") {
      toast.error("No Items to checkout");
    } else {
      toast.error("Failed to create the order: " + error.message);
    }
  };

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const replaceStringinInt = (orderTotalString: any) => {
    const numericString = orderTotalString?.replace(/₨|&nbsp;|,|[^0-9.]/g, '');
    const orderTotalNumber = parseFloat(numericString);
    return orderTotalNumber;
  };

  const numericOrderTotal = replaceStringinInt(orderTotal);

  const threePercentFromTotal = numericOrderTotal * 0.03;

  const taxWithTotal = (numericOrderTotal + threePercentFromTotal).toFixed(2);
  console.log('inttotal', parseInt(taxWithTotal));
  console.log('orderTotal', orderTotal);

  useEffect(() => {
    if (isCardPayment) {
      // setOrderTotal()
    }
  }, orderTotal)

  console.log('afeter effet', orderTotal);

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
        <PaymentModal
          show={showBankTransfer}
          setShowBankTransfer={setShowBankTransfer}
          setWantToSHowBankTransfer={setWantToSHowBankTransfer}
          paymentDetails={paymentDetails}
        />
        <div className="mb-16">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl ">
            Checkout
          </h2>

          <div className="mt-3 block text-xs font-medium text-slate-700 sm:mt-5 sm:text-sm dark:text-slate-400">
            <Link href={"/#"} className="">
              Homepage
            </Link>
            <span className="mx-1 text-xs sm:mx-1.5">/</span>
            <span className="underline">Checkout</span>
          </div>
        </div>{" "}
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
              setIsCardPayment={setIsCardPayment}
              isCardPayment={isCardPayment}
            />
          </div>

          <div className="my-10 flex-shrink-0 border-t border-slate-200 lg:mx-10 lg:my-0 lg:border-l lg:border-t-0 xl:lg:mx-14 2xl:mx-16 dark:border-slate-700 "></div>

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

            <div className="mt-10 border-t border-slate-200/70 pt-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 ">
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
                  <span dangerouslySetInnerHTML={{ __html: cart?.subtotal || "0.00" }} />
                </span>
              </div>

              {!isStorePickup && (
                <div className="flex justify-between py-2.5">
                  <span>Shipping estimate</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    <span dangerouslySetInnerHTML={{ __html: cart?.shippingTotal || "0.00" }} />
                  </span>
                </div>
              )}

              {isCardPayment && (
                <div className="flex justify-between py-2.5">
                  <span>Card Tax</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {/* {JSON.stringify(orderTotal)} */}
                    {/* <span dangerouslySetInnerHTML={{ __html: `₨&nbsp;threePercentFromTotal` || "0.00" }} /> */}
                    <span>Rs {(threePercentFromTotal).toFixed(2) || "0.00"}</span>
                  </span>
                </div>
              )}

              {isCardPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span dangerouslySetInnerHTML={{ __html: `Rs ${(numericOrderTotal + threePercentFromTotal).toFixed(2)}` || "0.00" }} />
                </div>)}


              {!isCardPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span dangerouslySetInnerHTML={{ __html: orderTotal || "0.00" }} />
                </div>)}



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
                ? "cursor-not-allowed bg-slate-500"
                : "bg-primary hover:bg-primary-dark"
                }`}
            >
              {loading ? (
                <Loader className="animate-spin text-gray-100 " />
              ) : (
                "Confirm Order"
              )}
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

            <div className="mt-5 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              <div className=" relative flex gap-2 pl-5">
                <Info />

                <div>
                  <div>By proceeding with your purchase you agree to our </div>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={"/terms-and-conditions"}
                    className="font-medium text-slate-900 underline dark:text-slate-200"
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
                    className="font-medium text-slate-900 underline dark:text-slate-200"
                  >
                    Privacy Policy
                  </Link>
                  {` `}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
