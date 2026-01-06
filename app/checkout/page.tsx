/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { FetchResult, useMutation, useQuery } from "@apollo/client";
import ButtonPrimary from "shared/Button/ButtonPrimary";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import {
  UPDATE_SHIPPING_TOTAL,
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
import koko from "@/public/koko.png";
import CheckoutDetails from "./CheckoutDetails";
import CartItems from "./CartItems";
import { toast } from "sonner";
import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import Script from "next/script";
import { usePayhere } from "../components/Payment/Payhere";
import { redirect, useRouter } from "next/navigation";
import PaymentModal from "@/app/components/Payment/PaymentModal";
import { useSession } from "@/context/SessionProvider";
import { usePaymentGateways } from "@/context/PaymentProvider";
import { Info, Loader, Clock } from "lucide-react";
import {
  dummyPaymentData,
  savePaymentDetails,
  sentConfirmation,
  transformAddress,
} from "@/components/AddressPageComps/HelperComps";
import { useStats } from "react-instantsearch";
import { Metadata } from "next/types";
import Image from "next/image";
import PreOrderNotice from "@/components/PreOrderNotice";
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

const CheckoutPage = () => {
  const { cart, removeFromCart, updateCart } = useCart();
  const [finalOrderTotal, setFinalOrderTotal] = useState(null);
  const { customer, fetchCustomer } = useSession();

  const { paymentGateways } = usePaymentGateways();
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
  const [payherPaymentID, setPayherPaymentID] = useState<string | null>(null);

  const [payhereHandleStatus, setPayhereHandleStatus] =
    useState<PayhereStatus>("idle");

  const [isStorePickup, setIsStorePickup] = useState(false);
  const [isCardPayment, setIsCardPayment] = useState(false);
  const [isKokoPayment, setIsKokoPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState({
    contactInfo: false,
    deliveryAddress: false,
    paymentMethod: false,
    billingAddress: false,
  });

  const [shippingTotal, setShippingTotal] = useState();
  const [orderTotal, setOrderTotal] = useState<string | null>(null);
  const [paymentData, setPaymentData] =
    useState<PaymentDetailsWithoutUrls | null>(null);
  const [showBankTransfer, setShowBankTransfer] = useState<boolean>(false);
  const [wantToSHowBankTransfer, setWantToSHowBankTransfer] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalWithTax, setTotalWithTax] = useState<string | null>();
  const [isTOC, setTOC] = useState<boolean>(false);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);
  const [confirmOrderErrors, setConfirmOrderErrors] = useState<string[]>([]);
  const [guestCheckoutData, setGuestCheckoutData] = useState<any>();
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [htmlFormResponse, setHtmlFormResponse] = useState<string | null>(null);

  const handleTOC = () => {
    // Toggle the state and get the updated value
    const updatedTOC = !isTOC;
    setTOC(updatedTOC);

    // Log the updated value
  };
  // TODO: Uncomment this for the redirect on cart free
  useEffect(() => {
    if (cart && cart?.contents?.nodes?.length === 0) {
      router.push("/");
    }
    if (cart?.total !== null && cart?.total !== undefined) {
      setOrderTotal(cart?.total);
    }
  }, [cart]);

  useEffect(() => {
    fetchCustomer();
  }, []);

  // MUTATIONS
  const [updateCartShippingTotalMutation] = useMutation(UPDATE_SHIPPING_TOTAL);
  const [
    checkoutMutation,
    {
      data: realCheckoutData,
      loading: realCheckoutLoading,
      error: realCheckoutError,
    },
  ] = useMutation(CHECKOUT);

  const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);
  // const  [createOrderGuest] = useMutation(GUEST_CHECKOUT_MUTATION)
  const [
    guestCheckout,
    { loading: guestCheckoutLoading, error: guestCheckoutError },
  ] = useMutation(GUEST_CHECKOUT);


  // Creating a Order using For Guest. Instead of using direct checkout mutation.
  const [
    createOrderGuest,
    { loading: checkoutLoading, error: checkoutError, data: checkoutData },
  ] = useMutation(GUEST_CHECKOUT_MUTATION);

  // Contexts
  const router = useRouter();
  const initiatePayment = usePayhere();


  useEffect(() => {
    const hasFreeShipping: any = cart?.appliedCoupons?.some(
      (coupon) => coupon?.code === "free-shipping"
    );
    if (hasFreeShipping) {
      setFreeShipping(true);
    }
  }, [cart]);

  const updateFormData = (section: string, data: any) => {
    // Form data changing here!.

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

  const updateShippingTotal = async () => {
    const hasFreeShipping: any = cart?.appliedCoupons?.some(
      (coupon) => coupon?.code === "free-shipping"
    );
    if (hasFreeShipping) {
      setFreeShipping(true);
    }

    try {
      const shippingMethods = isStorePickup
        ? "pickup_location:0"
        : freeShipping
          ? "wbs:5c9bd062_free_shipping"
          : "wbs:0dd3bc79_weight_based_shipping";

      const total: any = cart?.total;
      setOrderTotal(freeShipping ? cart?.subtotal : total);

      if (customer?.id === "guest") {
        const subtotal: any = cart?.subtotal;

        if (isStorePickup || freeShipping) {
          setOrderTotal(subtotal);
        } else {
          setOrderTotal(total);
        }
      }

      const { data, errors } = await updateCartShippingTotalMutation({
        variables: { input: { shippingMethods } },
      });

      if (errors) {
        console.error("Error updating cart shipping total:", errors);
        return;
      }

      if (data?.updateShippingMethod?.cart) {
        const { total, shippingTotal, subtotal } =
          data.updateShippingMethod.cart;
        if (freeShipping) {
          setOrderTotal(subtotal);
          setShippingTotal(shippingTotal);
        } else {
          setOrderTotal(total);
          setShippingTotal(shippingTotal);
        }
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
  }, [isStorePickup, updateCartShippingTotalMutation, freeShipping]);

  const paymentDetails = useMemo(() => {
    return paymentData;
  }, [paymentData]);

  function ImplementBankTransfer() {
    setWantToSHowBankTransfer(false);
    setShowBankTransfer(true);
  }

  useEffect(() => {
    if (!paymentDetails) {
      return;
    }

    const isCashOnDelivery =
      formData?.paymentMethod?.selectedGateway?.id == "cod";
    // const isKokoPayment = formData?.paymentMethod?.selectedGateway?.id == "darazbnpl";

    let checkoutDetails = paymentDetails;

    const {
      shippingaddress1,
      shippingaddress2,
      city,
      billingaddress1,
      billingaddress2,
      lineItems,
      shippingTotal,
      subtotal,
      date,
    } = checkoutDetails;


    const updatedCheckoutDetails = {
      ...checkoutDetails,
      lineItems: lineItems,
      subtotal: subtotal,
      shippingTotal: shippingTotal,
      date: date,
      billingaddress1: billingaddress1,
      billingaddress2: billingaddress2,
      shippingaddress1: shippingaddress1,
      shippingaddress2: shippingaddress2,
      city: city,
    };

    if (isCashOnDelivery) {
      if (
        customer?.id === "guest" ||
        checkoutDetails.order_id == "guest_checkout"
      ) {
        const queryParams = new URLSearchParams({
          ...updatedCheckoutDetails,
          lineItems: JSON.stringify(updatedCheckoutDetails.lineItems),
          subtotal: String(updatedCheckoutDetails.subtotal),
          shippingTotal: String(updatedCheckoutDetails.shippingTotal),
          date: String(updatedCheckoutDetails.date ?? ""),
          billingaddress1: String(updatedCheckoutDetails.billingaddress1),
          billingaddress2: String(updatedCheckoutDetails.billingaddress2),
          shippingaddress1: String(updatedCheckoutDetails.shippingaddress1),
          shippingaddress2: String(updatedCheckoutDetails.shippingaddress2),
          city: updatedCheckoutDetails.city || "",
          order_id: updatedCheckoutDetails.order_id,
        }).toString();
        const redirectUrl = `/checkout/guest_checkout?${queryParams}&ordermethod=guest`;
        router.push(redirectUrl);
        return;
      }
      toast.info("You'll be on the thank you page in just a moment.");
      let redirectUrl = `checkout/${checkoutDetails.order_id}`;
      router.push(redirectUrl);
    }
  }, [paymentData]);

  const handleCheckoutProcess = async () => {
    let errors = [];
    if (!isConfirmed.contactInfo) {
      errors.push("Contact info is missing.");
    }
    if (!isConfirmed.deliveryAddress) {
      errors.push("Delivery address is missing.");
    }
    if (!isConfirmed.billingAddress) {
      errors.push("Billing address is missing.");
    }
    if (!isConfirmed.paymentMethod) {
      errors.push("Payment method is missing.");
    }
    if (!isTOC) {
      errors.push("Terms and conditions are not accepted.");
    }
    if (errors.length > 0) {
      setConfirmOrderErrors(errors);
      return;
    }

    const isBankTransfer =
      formData?.paymentMethod?.selectedGateway?.id == "bacs";
    const isPayhere = formData?.paymentMethod?.selectedGateway?.id == "payhere";
    const isCashOnDelivery =
      formData?.paymentMethod?.selectedGateway?.id == "cod";
    const isKokoPayment =
      formData?.paymentMethod?.selectedGateway?.id == "darazbnpl";
    const isGeniePayment =
      formData?.paymentMethod?.selectedGateway?.id == "geniebiz";

    if (isBankTransfer) {
      if (wantToSHowBankTransfer) {
        // First create the order and get payment details, then open modal
        const checkoutResult = await handleCheckout();
        if (checkoutResult) {
          ImplementBankTransfer();
        }
        return;
      }
      try {
        // First create the order and get payment details, then open modal
        const checkoutResult = await handleCheckout();
        if (checkoutResult) {
          ImplementBankTransfer();
        }
      } catch (e) {
        toast.error(
          "Sorry to hear that you are facing an issue with Bank Transfer. Please try again later."
        );
      }
    }
    if (isGeniePayment) {
      await handleCheckout();
      return;
    }

    if (isPayhere) {
      await handleCheckout();
      return;
    }

    if (isCashOnDelivery || isKokoPayment) {
      await handleCheckout();
    }
  };

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const isPayhere =
        formData?.paymentMethod?.selectedGateway?.id == "payhere";

      const paymentMethodId = formData?.paymentMethod?.selectedGateway?.id;

      console.log("paymentMethodId", paymentMethodId);
      console.log("formData", formData);

      if (paymentMethodId === undefined) {
        console.error("Payment method ID is undefined");
        toast.error("Payment Method was not chosen.");
        return null;
      }

      formData.billingAddress.country = "LK";
      formData.deliveryAddress.country = "LK";

      const shippingMethod = getShippingMethod(shippingTotal);
      const shippingDetails = isStorePickup
        ? {
          ...transformAddress(formData.deliveryAddress),
          address1: "Store Pickup",
          address2: "",
          city: "Store Pickup",
          state: "",
          postcode: "",
        }
        : transformAddress(formData.deliveryAddress);

      const email = formData?.contactInfo?.email;

      const billingDetails = {
        ...transformAddress(formData.billingAddress),
        email: formData?.contactInfo?.email,
        phone: formData?.contactInfo?.phone,
      };

      const customerNoteHTML = `
            <p><strong>Customer Email:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${formData?.contactInfo?.phone
        }</p>
            ${isStorePickup
          ? "<p><strong>Pickup Location:</strong> Store</p>"
          : ""
        }
            ${isKokoPayment
          ? "<p><strong>Payment Method:</strong> Koko Pay</p>"
          : ""
        }
        `;

      const variables = {
        input: {
          paymentMethod: paymentMethodId,
          shippingMethod,
          shipping: shippingDetails,
          billing: billingDetails,
          customerNote: customerNoteHTML,
          metaData: [
            {
              key: "payhere_order_id",
              value: payherPaymentID ?? "",
            },
          ],
        },
      };

      const { data, errors } =
        customer?.id === "guest"
          ? await guestCheckout({ variables })
          : await checkoutMutation({ variables });


      // Store order data in localStorage for both guest and logged-in users
      if (data) {
        localStorage.setItem("last_order", JSON.stringify(data));
      }

      //Koko Payment
      if (isKokoPayment) {
        const orderData = {
          order_id: data?.checkout?.order?.databaseId,
        };
        localStorage.setItem("last_order", JSON.stringify(data));
        handleKoko(orderData);
      }

      // FOR GUEST CHECKOUT
      let guestCheckoutData = data;

      const isBankTransfer =
        formData?.paymentMethod?.selectedGateway?.id == "bacs";

      const isGuest = customer?.id === "guest";

      if (isPayhere && isGuest) {
        localStorage.setItem(
          "payhere_last_order",
          JSON.stringify(guestCheckoutData)
        );
        router.push(`/checkout/payhere/guest_order`);
        return;
      }

      if (isPayhere && !isGuest) {
        const orderId = data?.checkout?.order?.databaseId;
        router.push(`/checkout/payhere/${orderId}`);
        return;
      }

      // Genie Payment Redirect
      const isGeniePayment = formData?.paymentMethod?.selectedGateway?.id == "geniebiz";
      if (isGeniePayment && data?.checkout?.redirect) {
        // Check if checkout was successful
        if (data?.checkout?.result === "success") {
          handleGeniePayment(data);
          return;
        } else {
          toast.error("Checkout failed. Please try again.");
          return;
        }
      }

      if (data) {
        const checkoutDetails = savePaymentDetails(data);
        setPaymentData(checkoutDetails);

        if (isBankTransfer) {
          console.log("checkoutDetails", checkoutDetails);
          return checkoutDetails;
        } else {
          toast.success("🌟 Order Placed Successfully! 🚀");
          return null;
        }
      } else {
        toast.error("Something Went Wrong While Checkout");
        return null;
      }
    } catch (error) {
      handleCheckoutError(error);
      return null; // Explicitly return null on error
    } finally {
      setLoading(false);
    }
  };

  const getShippingMethod = (shippingTotal: any) => {
    const methodId = isStorePickup
      ? "pickup_location:0"
      : freeShipping
        ? "wbs:5c9bd062_free_shipping"
        : "wbs:0dd3bc79_weight_based_shipping";

    const methodTitle = isStorePickup
      ? "Store Pickup"
      : freeShipping
        ? "Free Shipping"
        : "Weight Based Shipping";

    const total = isStorePickup ? "0" : shippingTotal;

    return { methodId, methodTitle, total };
  };

  const handleCheckoutError = (error: any) => {
    setLoading(false);

    // Handle network errors
    if (error.networkError) {
      toast.error("Unable to connect to the server. Please check your internet connection and try again.");
      return;
    }

    // Check if it's a JSON parsing error indicating PHP output
    if (error.message && error.message.includes("Unexpected token")) {
      console.error("🚨 WordPress GraphQL Error - PHP output detected");
      console.error("Raw error:", error);
      toast.error("Server configuration error. Please contact support.");
      return;
    }

    // Handle session errors
    if (error.message === "Sorry, no session found.") {
      if (customer?.id !== "guest") {
        toast.error("Please login or create an account to checkout");
        router.push("/login");
      } else {
        toast.error("Session expired. Please reload the page or login again.");
      }
      return;
    }

    // Handle GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      const errorMessage = graphQLError.message || graphQLError.extensions?.message;

      if (errorMessage?.includes("out of stock") || errorMessage?.includes("stock")) {
        toast.error("Some items in your cart are out of stock. Please update your cart and try again.");
        return;
      }

      if (errorMessage?.includes("payment") || errorMessage?.includes("gateway")) {
        toast.error("Payment processing error. Please try a different payment method.");
        return;
      }

      if (errorMessage?.includes("shipping") || errorMessage?.includes("address")) {
        toast.error("Shipping information error. Please check your address and try again.");
        return;
      }

      if (errorMessage?.includes("cart") || errorMessage?.includes("empty")) {
        toast.error("Your cart is empty. Please add items before checkout.");
        return;
      }

      toast.error("Checkout failed due to a server error. Please try again.");
      return;
    }

    // Handle HTTP status codes
    if (error.message) {
      if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
        toast.error("Server error occurred. Please try again in a few moments.");
        return;
      }

      if (error.message.includes("400") || error.message.includes("Bad Request")) {
        toast.error("Invalid request. Please check your information and try again.");
        return;
      }

      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        toast.error("Authentication required. Please login and try again.");
        return;
      }

      if (error.message.includes("403") || error.message.includes("Forbidden")) {
        toast.error("You don't have permission to perform this action. Please login and try again.");
        return;
      }

      if (error.message.includes("404") || error.message.includes("Not Found")) {
        toast.error("Service not available. Please try again later.");
        return;
      }

      if (error.message.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
        return;
      }

      if (error.message.includes("fetch") || error.message.includes("network")) {
        toast.error("Unable to connect to the server. Please check your internet connection and try again.");
        return;
      }

      // For other specific errors, show a more user-friendly message
      toast.error(`Checkout failed: ${error.message}`);
      return;
    }

    // Fallback for unknown errors
    toast.error("An unexpected error occurred during checkout. Please try again or contact support if the problem persists.");
  };

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const replaceStringinInt = (orderTotalString: any) => {
    const numericString = orderTotalString?.replace(/₨|&nbsp;|,|[^0-9.]/g, "");
    const orderTotalNumber = parseFloat(numericString);
    return orderTotalNumber;
  };

  const numericOrderTotal = replaceStringinInt(orderTotal);
  const cartSubtotal = replaceStringinInt(cart?.subtotal);
  const threePercentFromTotal = numericOrderTotal * 0.03;
  const TotalWithKoko = (cartSubtotal / 88) * 100;
  const taxWithTotal = (numericOrderTotal + threePercentFromTotal).toFixed(2);

  useEffect(() => {
    setTotalWithTax(taxWithTotal);
  }, [taxWithTotal]);

  // Check if cart contains pre-order products
  const hasPreOrderProducts = () => {
    try {
      const currentCart = cart;
      if (
        !currentCart ||
        !currentCart.contents ||
        !currentCart.contents.nodes
      ) {
        return false;
      }

      return currentCart.contents.nodes.some((node: any) => {
        const productTags = node.product?.node?.productTags?.nodes || [];
        return productTags.some((tag: any) => tag.slug === 'pre-order');
      });
    } catch (error) {
      console.error("Error while checking for pre-order products:", error);
      return false;
    }
  };

  const isPreOrderCart = hasPreOrderProducts();

  const handleKoko = async (orderData: any) => {
    toast.info("Redirecting to Koko payment portal...", {
      duration: 10000,
    });
    try {
      const response = await fetch("/api/koko", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      const kokoResponseData = JSON.parse(result.kokoResponse).data;
      setHtmlFormResponse(kokoResponseData);

      const formContainer = document.createElement("div");
      formContainer.innerHTML = kokoResponseData;
      document.body.appendChild(formContainer);

      const form = formContainer.querySelector("form");
      if (form) {
        form.submit();
      }
    } catch (error) {
      console.error("Koko payment error:", error);
      toast.error("Payment initiation failed. Please try again.");
    }
  };

  const handleGeniePayment = (checkoutData: any) => {
    try {
      const redirectUrl = checkoutData?.checkout?.redirect;

      if (!redirectUrl) {
        toast.error("Payment gateway URL not received. Please try again.");
        return;
      }

      // Store order data for reference
      localStorage.setItem("genie_last_order", JSON.stringify(checkoutData));

      // Show success message before redirect
      toast.success("Redirecting to payment gateway...");

      // Small delay to ensure toast is shown
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);

    } catch (error) {
      console.error("Genie payment redirect error:", error);
      toast.error("Payment redirect failed. Please try again.");
    }
  };

  return (
    <div className="nc-CheckoutPage">
      <Script
        type="text/javascript"
        src={"https://www.payhere.lk/lib/payhere.js"}
        onLoad={() => {
          // PayHere script loaded successfully
        }}
        onError={() => console.error("Error loading PayHere script")}
      />

      <main className="container py-8 md:py-16 lg:pb-28 lg:pt-20 ">
        <PaymentModal
          handleCheckout={handleCheckout}
          show={showBankTransfer}
          // show={true}
          setShowBankTransfer={setShowBankTransfer}
          setWantToSHowBankTransfer={setWantToSHowBankTransfer}
          paymentDetails={paymentDetails}
          customerEmail={formData?.contactInfo?.email}
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
              paymentGateways={paymentGateways || []}
              handleConfirmationChange={handleConfirmationChange}
              setIsStorePickup={setIsStorePickup}
              isStorePickup={isStorePickup}
              setIsCardPayment={setIsCardPayment}
              isCardPayment={isCardPayment}
              totalPayment={numericOrderTotal}
              setIsKokoPayment={setIsKokoPayment}
              isKokoPayment={isKokoPayment}
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
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cart?.subtotal || "0.00",
                    }}
                  />
                </span>
              </div>

              {!isStorePickup && (
                <div className="flex justify-between py-2.5">
                  <span>
                    {freeShipping ? `Free Shipping` : `Shipping estimate`}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {freeShipping ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: "0.00",
                        }}
                      />
                    ) : (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: cart?.shippingTotal || "0.00",
                        }}
                      />
                    )}
                  </span>
                </div>
              )}

              {/* {isCardPayment && (
                <div className="flex justify-between py-2.5">
                  <span>Bank Charge 3%</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {JSON.stringify(orderTotal)}
                    <span dangerouslySetInnerHTML={{ __html: `₨&nbsp;threePercentFromTotal` || "0.00" }} />
                    <span>Rs {threePercentFromTotal.toFixed(2) || "0.00"}</span>
                  </span>
                </div>
              )} */}

              {(isCardPayment || isKokoPayment) && (
                <div className="flex justify-between py-2.5">
                  <span className="text-red-500 font-medium">Sorry your missed the discount</span>
                </div>
              )}

              {/* {isKokoPayment && (
                <div className="flex justify-between py-2.5">
                  <span>Handling Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {JSON.stringify(TotalWithKoko)}
                    <span>
                      Rs {(TotalWithKoko - cartSubtotal).toFixed(2) || "0.00"}
                    </span>
                    {JSON.stringify(cartSubtotal)}
                  </span>
                </div>
              )} */}

              {isKokoPayment && (
                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1">
                  <span>pay in 3 x Rs</span>
                  <span className="font-semibold mx-1">
                    {(
                      parseFloat(
                        (TotalWithKoko + (isStorePickup ? 0 : 500) || "0")
                          .toString()
                          .replace(/[^\d.]/g, "")
                      ) / 3
                    ).toFixed(2)}
                  </span>
                  <span>with</span>
                  <span className="ml-1 inline-block">
                    <Image
                      src={koko}
                      alt="KOKO"
                      className="inline-block w-12 h-auto"
                    />
                  </span>
                </div>
              )}

              {isCardPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        `Rs ${new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          numericOrderTotal + threePercentFromTotal
                        )}` || "0.00",
                    }}
                  />
                </div>
              )}

              {isKokoPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        `Rs ${new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          TotalWithKoko + (isStorePickup ? 0 : 500)
                        )}` || "0.00",
                    }}
                  />
                </div>
              )}

              {!isCardPayment && !isKokoPayment && (
                <div className="flex justify-between pt-4 text-base font-semibold text-slate-900 dark:text-slate-200">
                  <span>Order total</span>

                  <span
                    dangerouslySetInnerHTML={{ __html: orderTotal || "0.00" }}
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-center items-center text-sm text-slate-500 dark:text-slate-400">
              <div className=" relative flex gap-2">
                <Checkbox
                  key={1}
                  label=""
                  name="toc"
                  defaultChecked={isTOC}
                  onChange={handleTOC}
                  sizeClassName="w-4 h-4"
                  className="pt-1"
                />

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

            {/* Pre-order Notice */}
            {isPreOrderCart && (
              <PreOrderNotice className="mt-6" />
            )}

            <ButtonPrimary
              onClick={handleCheckoutProcess}
              // disabled={
              //   !(
              //     isConfirmed.contactInfo &&
              //     isConfirmed.deliveryAddress &&
              //     isConfirmed.billingAddress &&
              //     isConfirmed.paymentMethod &&
              //     isTOC
              //   )
              // }
              className={`mt-8 w-full bg-primary hover:bg-primary-dark`}
            >
              {loading ? (
                <Loader className="animate-spin text-gray-100 " />
              ) : (
                "Confirm Order"
              )}
            </ButtonPrimary>

            {/* <ButtonPrimary
              onClick={handleKoko}
              className={`mt-8 w-full bg-primary hover:bg-primary-dark`}
            >
              Confirm Koko
            </ButtonPrimary> */}

            <div className="text-xs space-y-1.5 mt-4 pl-5">
              {confirmOrderErrors.map((error, index) => (
                <div key={index} className="text-red-500">
                  *{error}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isConfirmingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Confirming Your Order</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Please don&apos;t close this window while we confirm your
                order...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* {htmlFormResponse && (
        <div className="html-form-response" dangerouslySetInnerHTML={{ __html: htmlFormResponse }} />
      )} */}
    </div>
  );
};

export default CheckoutPage;
