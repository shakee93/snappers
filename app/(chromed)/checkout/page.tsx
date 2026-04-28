/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { FetchResult, useMutation, useQuery } from "@apollo/client";
import Input from "shared/Input/Input";
import Label from "components/Label/Label";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import {
  UPDATE_SHIPPING_TOTAL,
  APPLY_COUPON,
  REMOVE_COUPONS,
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
import { CheckoutSubmitPayload, DeliveryType } from "./UnifiedCheckoutForm";
import CartItems from "./CartItems";
import { OrderSummarySkeleton } from "./CheckoutSkeletons";
import { toast } from "sonner";
import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import Script from "next/script";
import { usePayhere } from "@/app/components/Payment/Payhere";
import { redirect, useRouter } from "next/navigation";
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
interface FormData {
  contactInfo: Record<string, any>;
  deliveryAddress: any;
  billingAddress: any;
  paymentMethod: {
    selectedGateway?: {
      id?: string;
    };
    bankSlipFile?: File | null;
  };
}

const CheckoutPage = () => {
  const { cart, removeFromCart, updateCart, clearCart, refreshCart, loading: cartLoading } = useCart();
  const [finalOrderTotal, setFinalOrderTotal] = useState(null);
  const { customer, fetchCustomer } = useSession();

  const { paymentGateways } = usePaymentGateways();

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

  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const noShipping = deliveryType === "store_pickup" || deliveryType === "flash_delivery";
  const [isCardPayment, setIsCardPayment] = useState(false);
  const [isKokoPayment, setIsKokoPayment] = useState(false);

  const [shippingTotal, setShippingTotal] = useState();
  const [orderTotal, setOrderTotal] = useState<string | null>(null);
  const [paymentData, setPaymentData] =
    useState<PaymentDetailsWithoutUrls | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalWithTax, setTotalWithTax] = useState<string | null>();
  const [isTOC, setTOC] = useState<boolean>(false);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);
  const [tocError, setTocError] = useState(false);
  const [guestCheckoutData, setGuestCheckoutData] = useState<any>();
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [htmlFormResponse, setHtmlFormResponse] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCouponSyncingCart, setIsCouponSyncingCart] = useState(false);
  const [hasSeenCartWithItems, setHasSeenCartWithItems] = useState(false);

  const [applyCouponMutation, { loading: applyingCoupon }] = useMutation(APPLY_COUPON);
  const [removeCouponsMutation, { loading: removingCoupon }] = useMutation(REMOVE_COUPONS);

  const handleTOC = () => {
    const updatedTOC = !isTOC;
    setTOC(updatedTOC);
    if (updatedTOC) {
      setTocError(false);
    }
  };
  // TODO: Uncomment this for the redirect on cart free
  useEffect(() => {
    if ((cart?.contents?.nodes?.length ?? 0) > 0) {
      setHasSeenCartWithItems(true);
    }
  }, [cart]);

  useEffect(() => {
    if (
      !hasSeenCartWithItems &&
      !isCouponSyncingCart &&
      !applyingCoupon &&
      !removingCoupon &&
      cart &&
      cart?.contents?.nodes?.length === 0
    ) {
      router.push("/");
    }

    if (cart?.total !== null && cart?.total !== undefined) {
      setOrderTotal(cart?.total);
    }
  }, [cart, hasSeenCartWithItems, isCouponSyncingCart, applyingCoupon, removingCoupon]);

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

  const updateShippingTotal = async () => {
    const hasFreeShipping: any = cart?.appliedCoupons?.some(
      (coupon) => coupon?.code === "free-shipping"
    );
    if (hasFreeShipping) {
      setFreeShipping(true);
    }

    try {
      const shippingMethods = noShipping
        ? "pickup_location:0"
        : freeShipping
          ? "wbs:5c9bd062_free_shipping"
          : "wbs:0dd3bc79_weight_based_shipping";

      const total: any = cart?.total;
      setOrderTotal(freeShipping ? cart?.subtotal : total);

      if (customer?.id === "guest") {
        const subtotal: any = cart?.subtotal;

        if (noShipping || freeShipping) {
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
    // Skip until the cart has actually loaded. Firing the WBS mutation
    // against an empty/unready cart on first paint produces a hung/error
    // state that froze the page on the first add-to-cart → /checkout flow.
    if (!cart?.contents?.itemCount) return;
    updateShippingTotal().then((r) => r);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit the unstable mutation fn ref
  }, [deliveryType, freeShipping, cart?.contents?.itemCount]);

  const paymentDetails = useMemo(() => {
    return paymentData;
  }, [paymentData]);

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

  const submitCheckout = async (data: CheckoutSubmitPayload) => {
    if (!isTOC) {
      setTocError(true);
      const el = document.getElementById("toc-section");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setTocError(false);

    // Sync form state for downstream effects (e.g. paymentData → COD redirect)
    updateFormData("contactInfo", data.contactInfo);
    updateFormData("deliveryAddress", data.deliveryAddress);
    updateFormData("billingAddress", data.billingAddress);
    updateFormData("paymentMethod", data.paymentMethod);

    await handleCheckoutProcess(data);
  };

  const handleCheckoutProcess = async (data: CheckoutSubmitPayload) => {
    const gatewayId = data.paymentMethod.selectedGateway.id;
    const isBankTransfer = gatewayId === "bacs";

    if (isBankTransfer) {
      const bankSlipFile = data.paymentMethod.bankSlipFile;
      if (!bankSlipFile) {
        toast.error("Please upload your bank slip before confirming the order.");
        return;
      }

      try {
        const checkoutResult = await handleCheckout(data);
        if (checkoutResult && checkoutResult.order_id) {
          await uploadBankSlip(bankSlipFile, checkoutResult);
        }
      } catch (e) {
        toast.error(
          "Sorry to hear that you are facing an issue with Bank Transfer. Please try again later."
        );
      }
      return;
    }

    await handleCheckout(data);
  };

  const handleCheckout = async (data: CheckoutSubmitPayload) => {
    setLoading(true);

    try {
      const gatewayId = data.paymentMethod.selectedGateway.id;
      const isPayhere = gatewayId === "payhere";
      const paymentMethodId = gatewayId;
      const orderDeliveryType = data.deliveryType;
      const isStorePickupOrder = orderDeliveryType === "store_pickup";
      const isFlashDeliveryOrder = orderDeliveryType === "flash_delivery";
      const contactEmail = data.contactInfo.email;
      const contactPhone = data.contactInfo.phone;

      if (!paymentMethodId) {
        console.error("Payment method ID is missing");
        toast.error("Payment Method was not chosen.");
        return null;
      }

      const shippingMethod = getShippingMethod(shippingTotal, orderDeliveryType);
      const storePickupAddressOverride = {
        address1: "Store Pickup",
        address2: "",
        city: "Store Pickup",
        state: "",
        postcode: "",
        country: "LK",
      };

      const shippingDetails = isStorePickupOrder
        ? {
          ...transformAddress(data.deliveryAddress),
          ...storePickupAddressOverride,
        }
        : transformAddress(data.deliveryAddress);

      const billingDetails = isStorePickupOrder
        ? {
          ...transformAddress(data.billingAddress),
          ...storePickupAddressOverride,
          email: contactEmail,
          phone: contactPhone,
        }
        : {
          ...transformAddress(data.billingAddress),
          email: contactEmail,
          phone: contactPhone,
        };

      const customerNoteHTML = `
            <p><strong>Customer Email:</strong> ${contactEmail}</p>
            <p><strong>Phone Number:</strong> ${contactPhone}</p>
            ${isStorePickupOrder
          ? "<p><strong>Pickup Location:</strong> Store</p>"
          : ""
        }
            ${isFlashDeliveryOrder
          ? "<p><strong>Delivery Method:</strong> Flash Delivery — customer arranges Uber/PickMe pickup</p>"
          : ""
        }
            ${gatewayId === "darazbnpl"
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

      const { data: mutationData, errors } =
        customer?.id === "guest"
          ? await guestCheckout({ variables })
          : await checkoutMutation({ variables });

      if (errors?.length) {
        const msg =
          errors.map((e: { message?: string }) => e.message).filter(Boolean).join(" ") ||
          "Checkout failed.";
        toast.error(msg);
        return null;
      }

      if (!mutationData?.checkout) {
        toast.error("Checkout failed. Please try again.");
        return null;
      }

      // Store order data in localStorage for both guest and logged-in users
      localStorage.setItem("last_order", JSON.stringify(mutationData));

      if (gatewayId === "darazbnpl") {
        const orderData = {
          order_id: mutationData?.checkout?.order?.databaseId,
        };
        handleKoko(orderData);
        return null;
      }

      // NDB-Pay payment flow
      if (gatewayId === "ndb-pay") {
        const orderTotalRaw = mutationData?.checkout?.order?.total;
        const rawAmount = orderTotalRaw?.replace(/[^0-9.]/g, "") || "0.00";
        const numericAmount = parseFloat(rawAmount).toFixed(2);

        const billingAddress = transformAddress(data.billingAddress);
        const shippingAddress = isStorePickupOrder
          ? {
              ...transformAddress(data.deliveryAddress),
              address1: "Store Pickup",
              city: "Store Pickup",
            }
          : transformAddress(data.deliveryAddress);

        const orderData = {
          order_id: mutationData?.checkout?.order?.databaseId,
          amount: numericAmount,
          currency: "LKR",
          email: contactEmail,
          phone: contactPhone,
          bill_to_forename: billingAddress.firstName || "",
          bill_to_surname: billingAddress.lastName || "",
          bill_to_address_line1: billingAddress.address1 || "",
          bill_to_address_line2: billingAddress.address2 || "",
          bill_to_address_city: billingAddress.city || "",
          bill_to_address_state: billingAddress.state || "",
          bill_to_address_postal_code: billingAddress.postcode || "",
          bill_to_address_country: billingAddress.country || "LK",
          bill_to_email: contactEmail || "",
          bill_to_phone: contactPhone || "",
          ship_to_forename: shippingAddress.firstName || "",
          ship_to_surname: shippingAddress.lastName || "",
          ship_to_address_line1: shippingAddress.address1 || "",
          ship_to_address_line2: shippingAddress.address2 || "",
          ship_to_address_city: shippingAddress.city || "",
          ship_to_address_state: shippingAddress.state || "",
          ship_to_address_postal_code: shippingAddress.postcode || "",
          ship_to_address_country: shippingAddress.country || "LK",
        };

        localStorage.setItem("last_order", JSON.stringify(mutationData));
        handleNdbPay(orderData);
        return null;
      }

      const isBankTransfer = gatewayId === "bacs";
      const isGuest = customer?.id === "guest";

      if (isPayhere && isGuest) {
        const orderDbId = mutationData?.checkout?.order?.databaseId;
        if (!orderDbId) {
          toast.error("Could not create order for payment.");
          return null;
        }
        localStorage.setItem(
          "payhere_last_order",
          JSON.stringify(mutationData)
        );
        router.push(`/checkout/payhere/guest_order`);
        return null;
      }

      if (isPayhere && !isGuest) {
        const orderId = mutationData?.checkout?.order?.databaseId;
        if (!orderId) {
          toast.error("Could not create order for payment.");
          return null;
        }
        router.push(`/checkout/payhere/${orderId}`);
        return null;
      }

      // Genie Payment Redirect
      if (gatewayId === "geniebiz" && mutationData?.checkout?.redirect) {
        if (mutationData?.checkout?.result === "success") {
          handleGeniePayment(mutationData);
          return;
        } else {
          toast.error("Checkout failed. Please try again.");
          return;
        }
      }

      if (mutationData) {
        const checkoutDetails = savePaymentDetails(mutationData);
        setPaymentData(checkoutDetails);

        if (isBankTransfer) {
          return checkoutDetails;
        } else {
          try {
            await clearCart();
          } catch (error: unknown) {
            if (
              error instanceof Error &&
              !error.message.includes("No items in cart to remove")
            ) {
              console.error("Error clearing cart:", error);
            }
          }
          toast.success("🌟 Order Placed Successfully! 🚀");
          return null;
        }
      } else {
        toast.error("Something Went Wrong While Checkout");
        return null;
      }
    } catch (error) {
      handleCheckoutError(error);
    } finally {
      setLoading(false);
    }
  };

  const getShippingMethod = (
    shippingTotal: any,
    orderDeliveryType: DeliveryType | null,
  ) => {
    const noCharge =
      orderDeliveryType === "store_pickup" ||
      orderDeliveryType === "flash_delivery";

    const methodId = noCharge
      ? "pickup_location:0"
      : freeShipping
        ? "wbs:5c9bd062_free_shipping"
        : "wbs:0dd3bc79_weight_based_shipping";

    const methodTitle = orderDeliveryType === "store_pickup"
      ? "Store Pickup"
      : orderDeliveryType === "flash_delivery"
        ? "Flash Delivery (Uber/PickMe)"
        : freeShipping
          ? "Free Shipping"
          : "Weight Based Shipping";

    const total = noCharge ? "0" : shippingTotal;

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

  const replaceStringinInt = (orderTotalString: any) => {
    const numericString = orderTotalString?.replace(/₨|&nbsp;|,|[^0-9.]/g, "");
    const orderTotalNumber = parseFloat(numericString);
    return orderTotalNumber;
  };

  const numericOrderTotal = replaceStringinInt(orderTotal);
  const cartSubtotal = replaceStringinInt(cart?.subtotal);
  const numericDiscountTotal = replaceStringinInt(cart?.discountTotal);
  const hasDiscount = Number.isFinite(numericDiscountTotal) && numericDiscountTotal > 0;

  const catalogSavings = (cart?.contents?.nodes || []).reduce((sum: number, item: any) => {
    const node = item?.product?.node;
    const isVariable = node?.type === "VARIABLE";
    const sale = replaceStringinInt(isVariable ? item?.variation?.node?.price : node?.price);
    const regular = replaceStringinInt(isVariable ? item?.variation?.node?.regularPrice : node?.regularPrice);
    if (!Number.isFinite(sale) || !Number.isFinite(regular) || regular <= sale) return sum;
    return sum + (regular - sale) * (item?.quantity || 0);
  }, 0);
  const threePercentFromTotal = numericOrderTotal * 0.03;
  const TotalWithKoko = (cartSubtotal / 88) * 100;
  const taxWithTotal = (numericOrderTotal + threePercentFromTotal).toFixed(2);

  const formatRs = (n: number) =>
    `Rs ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)}`;

  const orderTotalLabel = isCardPayment
    ? formatRs(numericOrderTotal + threePercentFromTotal)
    : isKokoPayment
    ? formatRs(TotalWithKoko + (noShipping ? 0 : 500))
    : (orderTotal || "");

  useEffect(() => {
    setTotalWithTax(taxWithTotal);
  }, [taxWithTotal]);

  const isPreOrderProduct = (product: any) => {
    const tags = product?.productTags?.nodes || [];
    const hasPreOrderTag = tags.some((tag: any) => {
      const slug = String(tag.slug || "").toLowerCase();
      const name = String(tag.name || "").toLowerCase();
      return slug === "pre-order" || slug === "preorder" || slug.includes("pre-order") || name.includes("pre order");
    });
    if (hasPreOrderTag) return true;

    const productName = String(product?.name || "").toLowerCase();
    if (productName.includes("pre-order") || productName.includes("preorder") || productName.includes("pre order")) {
      return true;
    }

    return false;
  };

  const hasPreOrderProducts = () => {
    try {
      const currentCart = cart;
      if (!currentCart?.contents?.nodes) return false;

      return currentCart.contents.nodes.some((node: any) => {
        const productNode = node.product?.node || node.product;
        console.log("[PreOrder Debug] Cart item product:", productNode?.name, "tags:", productNode?.productTags?.nodes);
        return isPreOrderProduct(productNode);
      });
    } catch (error) {
      console.error("Error checking for pre-order products:", error);
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

  const handleNdbPay = async (orderData: any) => {
    toast.info("Redirecting to NDB-Pay payment portal...", {
      duration: 10000,
    });
    try {
      const response = await fetch("/api/ndb-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
      }

      const formHtml = await response.text();
      if (!formHtml || formHtml.trim().length === 0) {
        throw new Error("Empty response from server");
      }

      if (formHtml.trim().startsWith("{")) {
        try {
          const errorData = JSON.parse(formHtml);
          throw new Error(errorData.error || errorData.message || "Unknown error from server");
        } catch {
          // Not JSON, continue as HTML
        }
      }

      setHtmlFormResponse(formHtml);

      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = formHtml;
      const formWrapper = tempContainer.querySelector("#ndb-pay-form-container") as HTMLDivElement;

      if (!formWrapper) {
        throw new Error("No form container found in response");
      }

      const checkoutFormWrapper = document.getElementById("ndb-pay-form-wrapper");
      if (!checkoutFormWrapper) {
        throw new Error("Checkout form wrapper not found");
      }

      checkoutFormWrapper.innerHTML = "";
      checkoutFormWrapper.appendChild(formWrapper);

      const form = formWrapper.querySelector("form") as HTMLFormElement;
      if (!form) {
        throw new Error("No form element found in response");
      }

      const submitButton = document.createElement("button");
      submitButton.textContent = "Pay Now";
      submitButton.style.display = "none";
      submitButton.type = "submit";
      form.appendChild(submitButton);

      setTimeout(() => {
        const submitBtn = document.querySelector(
          "#ndb-pay-form-container button[type=submit]"
        ) as HTMLButtonElement | null;
        submitBtn?.click();
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Payment initiation failed: ${errorMessage}`);
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

  const uploadBankSlip = async (file: File, checkoutDetails: PaymentDetailsWithoutUrls) => {
    try {
      toast.info("Uploading bank slip...");

      const orderId = checkoutDetails.order_id;
      if (!orderId) {
        toast.error("Order ID not found. Please try again.");
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("order_id", String(orderId));

      const response = await fetch(
        "https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/upload",
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const data = await response.json();

      if (data.message === "File uploaded successfully") {
        toast.success("Bank slip uploaded successfully!");

        try {
          await clearCart();
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            !error.message.includes("No items in cart to remove")
          ) {
            console.error("Error clearing cart:", error);
          }
        }

        if (typeof orderId !== "string") {
          await sentConfirmation(orderId as number);
        }

        if (customer?.id === "guest" || checkoutDetails.order_id === "guest_checkout") {
          const queryParams = new URLSearchParams({
            ...checkoutDetails,
            lineItems: JSON.stringify(checkoutDetails.lineItems),
            subtotal: String(checkoutDetails.subtotal),
            shippingTotal: String(checkoutDetails.shippingTotal),
            date: String(checkoutDetails.date ?? ""),
            billingaddress1: String(checkoutDetails.billingaddress1 || ""),
            billingaddress2: String(checkoutDetails.billingaddress2 || ""),
            shippingaddress1: String(checkoutDetails.shippingaddress1 || ""),
            shippingaddress2: String(checkoutDetails.shippingaddress2 || ""),
            city: checkoutDetails.city || "",
            order_id: String(checkoutDetails.order_id),
          }).toString();
          const redirectUrl = `/checkout/guest_checkout?${queryParams}&ordermethod=guest`;
          router.push(redirectUrl);
        } else {
          router.push(`/checkout/${orderId}`);
        }
      } else if (data.error) {
        toast.error("An issue occurred during the bank slip upload process.");
      }
    } catch (error) {
      console.error("Error uploading bank slip:", error);
      toast.error("Failed to upload bank slip. Please try again.");
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
      <div className="flex flex-col-reverse lg:flex-row mx-auto">
        <div className="lg:w-1/2 w-full bg-white border-gray-300">
          <div className="p-6 max-w-[625px] ml-auto">
          <CheckoutDetails
              paymentGateways={isPreOrderCart
                ? (paymentGateways || []).filter((g: any) => g.id === 'cod' || g.id === 'bacs')
                : (paymentGateways || [])
              }
              setDeliveryType={setDeliveryType}
              deliveryType={deliveryType}
              setIsCardPayment={setIsCardPayment}
              isCardPayment={isCardPayment}
              totalPayment={numericOrderTotal}
              kokoTotal={TotalWithKoko + (noShipping ? 0 : 500)}
              setIsKokoPayment={setIsKokoPayment}
              isKokoPayment={isKokoPayment}
              onCheckoutSubmit={submitCheckout}
              isTOC={isTOC}
              onTOCChange={handleTOC}
              tocError={tocError}
              loading={loading}
              orderTotalLabel={orderTotalLabel}
            />
          </div>
        </div>
        <div className="lg:w-1/2 w-full border-l-1 border-gray-300">
          <div className="lg:sticky lg:top-[80px] p-6 max-w-[625px] mr-auto">
          <div id="order-cart" className="w-full">
            {(!cart || (cartLoading && !cart?.contents?.nodes?.length)) ? (
              <OrderSummarySkeleton items={2} />
            ) : (
            <>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Order summary
              {cart?.contents?.nodes?.length ? (
                <span className="text-slate-400">
                  {" · "}
                  {cart.contents.nodes.length} item{cart.contents.nodes.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </h3>
            <div className="divide-y divide-slate-200/70 dark:divide-slate-700 pr-5">
              {cart?.contents?.nodes.map((item, index) => (
                <CartItems
                  index={index}
                  key={(item as any)?.key ?? index}
                  item={item as any}
                  onQuantityChange={updateCart}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200/70 pt-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 ">
              <div>
                <Label className="text-sm">Discount code</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    sizeClass="h-10 px-4 py-3 !rounded-full"
                    className={`flex-1 ${
                      couponStatus === "error"
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : couponStatus === "success"
                        ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200"
                        : ""
                    }`}
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponStatus !== "idle") {
                        setCouponStatus("idle");
                        setCouponMessage(null);
                      }
                    }}
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const code = couponCode.trim();
                      if (!code) {
                        toast.error("Please enter a coupon code.");
                        setCouponStatus("error");
                        setCouponMessage("Please enter a coupon code.");
                        return;
                      }
                      try {
                        setIsCouponSyncingCart(true);
                        setCouponStatus("idle");
                        setCouponMessage(null);

                        const { data } = await applyCouponMutation({
                          variables: { code },
                        });

                        if (data?.applyCoupon?.applied?.code) {
                          const successText = "Coupon applied successfully.";
                          toast.success(successText);
                          setCouponStatus("success");
                          setCouponMessage(successText);
                          await refreshCart();
                        } else {
                          const failText = "Coupon could not be applied.";
                          toast.error(failText);
                          setCouponStatus("error");
                          setCouponMessage(failText);
                        }
                      } catch (error: any) {
                        const rawMessage =
                          error?.graphQLErrors?.[0]?.message ||
                          error?.message ||
                          "Failed to apply coupon.";
                        const cleanedMessage = rawMessage.replace(/&quot;/g, '"');
                        toast.error(cleanedMessage);
                        setCouponStatus("error");
                        setCouponMessage(cleanedMessage);
                      } finally {
                        setIsCouponSyncingCart(false);
                      }
                    }}
                    disabled={applyingCoupon}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {applyingCoupon ? (
                      <Loader className="w-4 h-4 animate-spin text-gray-100" />
                    ) : (
                      "Apply coupon"
                    )}
                  </button>
                </div>

                {couponMessage && (
                  <div
                    className={`mt-1 flex items-center text-xs ${
                      couponStatus === "error"
                        ? "text-red-600"
                        : couponStatus === "success"
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="mr-1 text-sm">
                      {couponStatus === "error" ? "⚠" : "✓"}
                    </span>
                    <span>{couponMessage}</span>
                  </div>
                )}

                {cart?.appliedCoupons && cart.appliedCoupons.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-xs font-medium text-emerald-600">
                      Coupon{cart.appliedCoupons.length > 1 ? "s" : ""} applied:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {cart.appliedCoupons.map((applied: any) => (
                        <div
                          key={applied.code}
                          className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
                        >
                          <span className="font-semibold uppercase">
                            {applied.code}
                          </span>
                          {applied.discountAmount && (
                            <span className="ml-2">
                              (<span
                                dangerouslySetInnerHTML={{
                                  __html: applied.discountAmount,
                                }}
                              />{" "}
                              off)
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setIsCouponSyncingCart(true);
                                const { data } = await removeCouponsMutation({
                                  variables: { codes: [applied.code] },
                                });

                                if (data?.removeCoupons?.cart) {
                                  toast.success("Coupon removed.");
                                  await refreshCart();
                                } else {
                                  toast.error("Coupon could not be removed.");
                                }
                              } catch (error: any) {
                                const message =
                                  error?.graphQLErrors?.[0]?.message ||
                                  error?.message ||
                                  "Failed to remove coupon.";
                                toast.error(message);
                              } finally {
                                setIsCouponSyncingCart(false);
                              }
                            }}
                            disabled={removingCoupon}
                            className="ml-2 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-200 disabled:opacity-60"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {catalogSavings > 0
                      ? formatRs(cartSubtotal + catalogSavings)
                      : (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cart?.subtotal || "0.00",
                          }}
                        />
                      )}
                  </span>
                </div>

                {catalogSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Promotion</span>
                    <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      − {formatRs(catalogSavings)}
                    </span>
                  </div>
                )}

                {hasDiscount && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Coupon</span>
                    <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      −{" "}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: cart?.discountTotal || "0.00",
                        }}
                      />
                    </span>
                  </div>
                )}

                {!noShipping && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {freeShipping ? `Free Shipping` : `Shipping estimate`}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {freeShipping ? (
                        <span dangerouslySetInnerHTML={{ __html: "0.00" }} />
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
              </div>
              {(isCardPayment || isKokoPayment) && (
                <div className="flex justify-between py-2.5">
                  <span className="text-red-500 font-medium">Sorry you missed the discount</span>
                </div>
              )}
              {isKokoPayment && (
                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1">
                  <span>pay in 3 x Rs</span>
                  <span className="font-semibold mx-1">
                    {(
                      parseFloat(
                        (TotalWithKoko + (noShipping ? 0 : 500) || "0")
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
                <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100">
                  <span className="text-base font-semibold">Order total</span>
                  <span
                    className="text-xl font-bold"
                    dangerouslySetInnerHTML={{
                      __html: formatRs(numericOrderTotal + threePercentFromTotal),
                    }}
                  />
                </div>
              )}

              {isKokoPayment && (
                <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100">
                  <span className="text-base font-semibold">Order total</span>
                  <span
                    className="text-xl font-bold"
                    dangerouslySetInnerHTML={{
                      __html: formatRs(TotalWithKoko + (noShipping ? 0 : 500)),
                    }}
                  />
                </div>
              )}

              {!isCardPayment && !isKokoPayment && (
                <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100">
                  <span className="text-base font-semibold">Order total</span>
                  <span
                    className="text-xl font-bold"
                    dangerouslySetInnerHTML={{ __html: orderTotal || "0.00" }}
                  />
                </div>
              )}

            </div>
            </>
            )}

            <div id="ndb-pay-form-wrapper" className="mt-6"></div>
          </div>
          </div>
        </div>
      </div>

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
