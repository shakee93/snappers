/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApolloClient } from "@apollo/client";
import { useCart } from "@/context/CartProvider";
import { GET_CART } from "@/graphql/defs/cart";
import { useShipping } from "@/hooks/useShipping";
import { useCheckoutAddressSync } from "@/hooks/useCheckoutAddressSync";
import { buildPinMetaData } from "@/lib/checkoutPinMeta";
import {
  resolveCatlitterDeliveryRate,
  resolveCourierRate,
  resolveFreeShippingRate,
} from "@/lib/checkoutShipping";
import { useCheckoutPaymentSync } from "@/hooks/useCheckoutPaymentSync";
import { useCheckout } from "@/hooks/useCheckout";
import {
  Cart,
  CheckoutPayload,
  CustomerAddressInput,
  PaymentGateway,
} from "@/graphql/types/graphql";
import koko from "@/public/koko.png";
import CheckoutDetails from "./CheckoutDetails";
import { CheckoutSubmitPayload, DeliveryType } from "./UnifiedCheckoutForm";
import CartItems, { CartItem } from "./CartItems";
import CheckoutCouponField from "./CheckoutCouponField";
import { OrderSummarySkeleton } from "./CheckoutSkeletons";
import { toast } from "sonner";
import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import Script from "next/script";
import { usePayhere } from "@/components/global/payment/Payhere";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import { usePaymentGateways } from "@/context/PaymentProvider";
import { Info, Loader, Clock } from "lucide-react";
import {
  savePaymentDetails,
  sentConfirmation,
  transformAddress,
} from "@/components/global/forms/HelperComps";
import { useStats } from "react-instantsearch";
import { Metadata } from "next/types";
import Image from "next/image";
import { siteConfig } from "@/site.config";
import { formatPrice, currencySymbol } from "@/lib/formatPrice";
import { apiUrl } from "@/lib/api";
import {
  CATLITTER_DELIVERY_TITLE,
  enrichCheckoutOrderStorage,
} from "@/components/account/accountOrderUtils";

const COUPON_RESTRICTED_GATEWAY_IDS =
  siteConfig.payment.couponRestrictedGatewayIds as readonly string[];
const PAY_ON_DELIVERY_GATEWAY_IDS =
  siteConfig.payment.payOnDeliveryGatewayIds as readonly string[];

import { RecalculatingAmount } from "@/components/global/ui/RecalculatingAmount";

const cartHasFreeShippingCoupon = (source: Cart | null | undefined) =>
  !!source?.appliedCoupons?.some((coupon) => coupon?.code === "free-shipping");

// WebXPay's `checkout.redirect` is the backend order-pay URL, but WebXPay
// rejects form posts from that host, so pay from our own page instead.
const webxpayPaymentPath = (
  orderPayUrl: string,
  orderId: number | null | undefined,
): string | null => {
  try {
    const key = new URL(orderPayUrl).searchParams.get("key");
    return orderId && key
      ? `/checkout/webxpay/${orderId}?key=${encodeURIComponent(key)}`
      : null;
  } catch {
    return null;
  }
};

const buildCustomerNote = ({
  email,
  phone,
  isStorePickup,
  isFlashDelivery,
  isKokoPay,
  customerNote,
}: {
  email: string;
  phone: string;
  isStorePickup: boolean;
  isFlashDelivery: boolean;
  isKokoPay: boolean;
  customerNote: string;
}) => {
  const lines = [
    `Customer Email: ${email}`,
    `Phone Number: ${phone}`,
    ...(isStorePickup ? ["Pickup Location: Store"] : []),
    ...(isFlashDelivery
      ? ["Delivery Method: Flash Delivery — customer arranges Uber/PickMe pickup"]
      : []),
    ...(isKokoPay ? ["Payment Method: Koko Pay"] : []),
    ...(customerNote ? ["", `Customer Note: ${customerNote}`] : []),
  ];

  return lines.join("\n");
};

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
  const { cart, removeFromCart, updateCart, clearCart, refreshCart, applyCart, loading: cartLoading } = useCart();
  const apolloClient = useApolloClient();
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
  const [isKokoPayment, setIsKokoPayment] = useState(false);
  // Selected gateway id — the summary lines price their woo-price-tiers unit
  // price off it while WooCommerce keeps owning the totals.
  const [selectedPaymentGatewayId, setSelectedPaymentGatewayId] = useState("");
  const isCouponRestrictedPayment = COUPON_RESTRICTED_GATEWAY_IDS.includes(
    selectedPaymentGatewayId,
  );

  const [shippingTotal, setShippingTotal] = useState<string | null | undefined>();
  const [paymentData, setPaymentData] =
    useState<PaymentDetailsWithoutUrls | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState(false);
  const redirectingRef = useRef(false);
  const [isTOC, setTOC] = useState<boolean>(false);
  const [tocError, setTocError] = useState(false);
  const [guestCheckoutData, setGuestCheckoutData] = useState<any>();
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [htmlFormResponse, setHtmlFormResponse] = useState<string | null>(null);
  const [isCouponSyncingCart, setIsCouponSyncingCart] = useState(false);
  const [hasSeenCartWithItems, setHasSeenCartWithItems] = useState(false);

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
      cart &&
      cart?.contents?.nodes?.length === 0
    ) {
      router.push("/");
    }

    if (noShipping) {
      setShippingTotal("0");
    } else if (cart?.shippingTotal != null) {
      setShippingTotal(cart.shippingTotal);
    }
  }, [cart, hasSeenCartWithItems, isCouponSyncingCart, noShipping]);

  useEffect(() => {
    fetchCustomer();
  }, []);

  // MUTATIONS
  const { updateCartShippingTotalMutation, shippingUpdating } = useShipping();
  const {
    checkoutMutation,
    realCheckoutData,
    realCheckoutLoading,
    realCheckoutError,
    completeOrderPayment,
    guestCheckout,
    guestCheckoutLoading,
    guestCheckoutError,
    createOrderGuest,
    checkoutLoading,
    checkoutError,
    checkoutData,
  } = useCheckout();

  // Contexts
  const router = useRouter();
  const initiatePayment = usePayhere();

  const preferFreeShipping = useMemo(
    () => cartHasFreeShippingCoupon(cart),
    [cart],
  );

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

  // AbortController for in-flight updateShippingMethod calls. If the user
  // toggles delivery method rapidly, an older call's response can land
  // after a newer one and overwrite local state with the wrong numbers.
  // We abort the previous call before starting a new one and bail on any
  // stale response that does come back.
  const shippingAbortRef = useRef<AbortController | null>(null);

  // `quotedCart` is the cart as the server just returned it. After an address
  // push the provider's `cart` is a render behind, and the rate ids we have to
  // choose from live on that response — so callers that just refetched pass it
  // in rather than letting us read a stale set.
  const updateShippingTotal = async (quotedCart?: Cart | null) => {
    const rateSource = quotedCart ?? cart;
    // Prefer the quoted cart's coupon set when one was just refetched —
    // the provider cart can lag a render behind.
    const preferFree = cartHasFreeShippingCoupon(rateSource);

    shippingAbortRef.current?.abort();
    const controller = new AbortController();
    shippingAbortRef.current = controller;

    try {
      // Mirror the mapping in getShippingMethod: store_pickup uses the
      // block-based pickup_location, flash_delivery uses the zone-bound
      // flat_rate:4 (free, configured backend-side as "Flash Delivery
      // (Uber/PickMe)"). CatLitter Delivery and courier both fall through to
      // whichever rate the store quoted for the current address — see
      // resolveCatlitterDeliveryRate / resolveCourierRate.
      // A free rate outranks both delivery options — see
      // resolveFreeShippingRate. Pickup and Flash keep their fixed ids.
      const freeRate = preferFree ? resolveFreeShippingRate(rateSource) : null;
      const shippingMethods =
        deliveryType === "flash_delivery"
          ? "flat_rate:4"
          : deliveryType === "store_pickup"
            ? "pickup_location:0"
            : freeRate?.id ??
              (deliveryType === "catlitter_delivery"
                ? resolveCatlitterDeliveryRate(rateSource)?.id
                : resolveCourierRate(rateSource, preferFree)?.id);

      // No rate means the address doesn't resolve to a serviceable zone yet.
      // Selecting nothing is correct — the cart keeps whatever WC last quoted,
      // and the summary is already showing that. The form only ever offers a
      // delivery option WooCommerce quoted, so this is the unserviceable-zone
      // case rather than a mismatched selection.
      if (!shippingMethods) {
        return;
      }

      const { data, errors } = await updateCartShippingTotalMutation({
        variables: { input: { shippingMethods } },
        context: { fetchOptions: { signal: controller.signal } },
      });

      // Stale response — a newer call has been started since we fired this one.
      if (controller.signal.aborted) return;

      if (errors) {
        console.error("Error updating cart shipping total:", errors);
        return;
      }

      if (data?.updateShippingMethod?.cart) {
        const updatedCart = data.updateShippingMethod.cart;
        // Push into the provider now — the summary prefers cart.shippingTotal,
        // and without this it keeps reading the pre-address cart until a later
        // refresh effect lands (which is what made the estimate look stuck).
        applyCart(updatedCart);
        setShippingTotal(noShipping ? "0" : updatedCart.shippingTotal);
      } else {
        console.error(
          "Failed to update cart shipping total. No valid data returned."
        );
      }
    } catch (error) {
      // AbortError is expected when superseded — don't log as an error.
      if (controller.signal.aborted) return;
      const name = (error as { name?: string })?.name;
      if (name === "AbortError") return;
      console.error("An error occurred while updating shipping total:", error);
    }
  };

  // The address the customer types is what WooCommerce quotes the rate
  // against, so once it lands server-side both the shipping line and the cart
  // totals on this page are stale. Pull the cart first: its
  // `availableShippingMethods` are re-quoted for the new address, and the
  // courier rate id we then select comes from that response. Reading it the
  // other way round selects against the previous address's rates, which is how
  // the total ended up one edit behind.
  const handleAddressSynced = async () => {
    // Goes straight to the client rather than through refreshCart() so the
    // rate ids are guaranteed to be the ones WooCommerce just quoted for the
    // new address: refreshCart() is a useLazyQuery execute that swallows some
    // errors and resolves undefined, and falling back to the provider's cart
    // would price against the previous destination.
    let quotedCart: Cart | null = null;
    try {
      const { data } = await apolloClient.query({
        query: GET_CART,
        variables: { recalculateTotals: true },
        fetchPolicy: "no-cache",
      });
      quotedCart = data?.cart ?? null;
    } catch (error) {
      // Fall through with a null cart: updateShippingTotal drops back to the
      // provider's copy, which is worth trying but may price against the
      // previous address.
      console.error("Failed to re-read the cart after address sync:", error);
    }

    // Surface the re-quoted cart immediately — the totals effect above picks
    // the new figures up from it. Waiting for updateShippingMethod before
    // touching the provider left the estimate row on the previous rate for the
    // whole mutation round-trip.
    if (quotedCart) {
      applyCart(quotedCart);
    }

    await updateShippingTotal(quotedCart);
  };

  const { syncCheckoutAddress, addressSyncing } =
    useCheckoutAddressSync(handleAddressSynced);

  // Same pattern as address sync: after chosen_payment_method lands in the WC
  // session, plugins that reprice by gateway (fees / price tiers) need a
  // recalculated cart before the summary can show the correct total.
  const handlePaymentSynced = async () => {
    try {
      const { data } = await apolloClient.query({
        query: GET_CART,
        variables: { recalculateTotals: true },
        fetchPolicy: "no-cache",
      });
      if (data?.cart) {
        applyCart(data.cart);
      }
    } catch (error) {
      console.error("Failed to re-read the cart after payment method sync:", error);
    }
  };

  const { syncCheckoutPaymentMethod, paymentSyncing } =
    useCheckoutPaymentSync(handlePaymentSynced);

  // The form calls this from effects, so it has to stay referentially stable.
  const handlePaymentMethodChange = useCallback(
    (gatewayId: string) => {
      setSelectedPaymentGatewayId(gatewayId);
      syncCheckoutPaymentMethod(gatewayId);
    },
    [syncCheckoutPaymentMethod],
  );

  // Totals are mid-flight while address, payment, shipping or coupon
  // recalculation is running — the summary rows and the Confirm button both key
  // off this, so no figure can be read while a superseded one is on screen.
  const totalsRecalculating =
    shippingUpdating || addressSyncing || paymentSyncing || isCouponSyncingCart;

  useEffect(() => {
    // Skip until the cart has actually loaded. Firing the WBS mutation
    // against an empty/unready cart on first paint produces a hung/error
    // state that froze the page on the first add-to-cart → /checkout flow.
    if (!cart?.contents?.itemCount) return;
    updateShippingTotal().then((r) => r);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit the unstable mutation fn ref
  }, [deliveryType, preferFreeShipping, cart?.contents?.itemCount]);

  // Abort any pending shipping-update on unmount so we don't write to
  // unmounted-component state.
  useEffect(() => {
    return () => {
      shippingAbortRef.current?.abort();
    };
  }, []);

  const paymentDetails = useMemo(() => {
    return paymentData;
  }, [paymentData]);

  useEffect(() => {
    if (!paymentDetails) {
      return;
    }

    // Every pay-on-delivery gateway lands here, not just Cash on Delivery.
    // Gating this on `cod` alone left Card on Delivery (`cheque`) creating the
    // order and clearing the cart but never navigating — the customer sat on
    // the checkout form with no confirmation.
    const isPayOnDelivery = PAY_ON_DELIVERY_GATEWAY_IDS.includes(
      formData?.paymentMethod?.selectedGateway?.id ?? "",
    );

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

    if (isPayOnDelivery) {
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
        address1: "",
        address2: "",
        city: "",
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

      const trimmedCustomerNote = data.customerNote?.trim() ?? "";
      const customerNote = buildCustomerNote({
        email: contactEmail,
        phone: contactPhone,
        isStorePickup: isStorePickupOrder,
        isFlashDelivery: isFlashDeliveryOrder,
        isKokoPay: gatewayId === "darazbnpl",
        customerNote: trimmedCustomerNote,
      });

      const variables = {
        input: {
          paymentMethod: paymentMethodId,
          shippingMethod,
          shipping: shippingDetails,
          billing: billingDetails,
          customerNote,
          metaData: [
            {
              key: "payhere_order_id",
              value: payherPaymentID ?? "",
            },
            ...(orderDeliveryType
              ? [{ key: "delivery_type", value: orderDeliveryType }]
              : []),
            ...buildPinMetaData({
              shipping: data.deliveryAddress,
              billing: data.billingAddress,
              isStorePickup: isStorePickupOrder,
            }),
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

      const storedCheckoutData = enrichCheckoutOrderStorage(
        mutationData,
        orderDeliveryType,
        shippingMethod.methodTitle,
      );

      // Store order data in localStorage for both guest and logged-in users
      localStorage.setItem("last_order", JSON.stringify(storedCheckoutData));

      const orderDbId =
        storedCheckoutData.checkout?.order?.databaseId?.toString();
      if (orderDbId && typeof window !== "undefined") {
        sessionStorage.setItem(
          `order_shipping_label_${orderDbId}`,
          shippingMethod.methodTitle,
        );
        if (orderDeliveryType) {
          sessionStorage.setItem(
            `order_delivery_type_${orderDbId}`,
            orderDeliveryType,
          );
        }
      }

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
              address1: "",
              address2: "",
              city: "",
            }
          : transformAddress(data.deliveryAddress);

        const orderData = {
          order_id: mutationData?.checkout?.order?.databaseId,
          amount: numericAmount,
          currency: siteConfig.locale.currencyCode,
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

        localStorage.setItem("last_order", JSON.stringify(storedCheckoutData));
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
          JSON.stringify(storedCheckoutData)
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

      // PayHere, Koko, and NDB already returned above. COD and bank transfer
      // finish in-app below. Only configured offsite gateways follow
      // `checkout.redirect` (Genie hosted checkout, WebXPay pay URL).
      const checkoutRedirect = mutationData?.checkout?.redirect;
      const checkoutSucceeded = mutationData?.checkout?.result === "success";
      const offsiteRedirectGatewayIds =
        siteConfig.payment.offsiteRedirectGatewayIds as readonly string[];
      const expectsOffsitePayment =
        offsiteRedirectGatewayIds.includes(gatewayId);

      if (expectsOffsitePayment) {
        const offsiteRedirect =
          gatewayId === "webxpay" && checkoutRedirect
            ? webxpayPaymentPath(
                checkoutRedirect,
                mutationData?.checkout?.order?.databaseId,
              )
            : checkoutRedirect;

        if (checkoutSucceeded && offsiteRedirect) {
          await handleOffsitePaymentRedirect(offsiteRedirect);
          return null;
        }

        await handleOffsitePaymentStartFailure(
          mutationData?.checkout?.order?.databaseId,
        );
        return null;
      }

      if (mutationData) {
        const checkoutDetails = savePaymentDetails(storedCheckoutData);
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
      await handleCheckoutError(error);
    } finally {
      if (!redirectingRef.current) {
        setLoading(false);
      }
    }
  };

  const getShippingMethod = (
    shippingTotal: any,
    orderDeliveryType: DeliveryType | null,
  ) => {
    const noCharge =
      orderDeliveryType === "store_pickup" ||
      orderDeliveryType === "flash_delivery";

    // store_pickup → block-based pickup_location method (instance 0).
    // flash_delivery → zone-bound flat_rate instance 4 ("Flash Delivery
    // (Uber/PickMe)" at cost 0). Configured via WooCommerce > Settings >
    // Shipping > Sri Lanka. Different mechanism from store pickup, but
    // both resolve to a free shipping line — and flat_rate keeps the
    // title verbatim so order admin shows "Flash Delivery (Uber/PickMe)"
    // instead of the pickup_location plugin's "<title> (<location>)" template.
    // CatLitter Delivery / courier: same dynamic rates as the cart-side
    // lookup. Falling back to the configured constant keeps the order writable
    // if the cart somehow has no rates to read, but the resolved id is what
    // the store actually quoted.
    const courierRate = resolveCourierRate(cart, preferFreeShipping);
    const catlitterRate = resolveCatlitterDeliveryRate(cart);
    // Mirrors updateShippingTotal: a free rate outranks either delivery option,
    // so the order is written with the same line the cart was priced at.
    const freeRate = preferFreeShipping ? resolveFreeShippingRate(cart) : null;

    const methodId =
      orderDeliveryType === "flash_delivery"
        ? "flat_rate:4"
        : orderDeliveryType === "store_pickup"
          ? "pickup_location:0"
          : freeRate?.id ??
            (orderDeliveryType === "catlitter_delivery"
              ? catlitterRate?.id ?? siteConfig.shipping.catlitterDeliveryMethodId
              : courierRate?.id ??
                (preferFreeShipping
                  ? siteConfig.shipping.freeShippingMethodId
                  : siteConfig.shipping.weightBasedShippingMethodId));

    // methodTitle is the display string for the order summary; for
    // flat_rate WC writes the zone-config title, for pickup_location WC
    // writes its own templated title — either way this string is
    // cosmetic on the cart side. The courier label is zone-dependent
    // ("Local Delivery" vs "Standard Shipping"), so prefer the quoted one
    // over a generic stand-in.
    const methodTitle = orderDeliveryType === "store_pickup"
      ? "Store Pickup"
      : orderDeliveryType === "flash_delivery"
        ? "Flash Delivery (Uber/PickMe)"
        : freeRate
          ? freeRate.label ?? "Free Shipping"
          : orderDeliveryType === "catlitter_delivery"
            ? catlitterRate?.label ?? CATLITTER_DELIVERY_TITLE
            : courierRate?.label ??
              (preferFreeShipping ? "Free Shipping" : "Weight Based Shipping");

    const total = noCharge ? "0" : shippingTotal;

    return { methodId, methodTitle, total };
  };

  // WooCommerce's cart-stock validator emits two distinct messages we want
  // to surface differently:
  //   • Out of stock  — `Sorry, "<name>" is not in stock. ...`
  //   • Insufficient  — `Sorry, we do not have enough "<name>" in stock to
  //                      fulfill your order (N available)`. Older WC
  //                      versions used "(N in stock)" — match the integer
  //                      and ignore the suffix wording.
  // The previous handler matched any substring "stock" and showed a single
  // "out of stock" toast, which mis-states the insufficient-quantity case.
  //
  // This is also the safety net for cap drift — getCartLineStockCap reads
  // stockQuantity from the cart fragment at fetch time, so if WP stock
  // changes between cart render and order submit, the FE cap may be stale
  // but WC's server-side validator still rejects and we surface the live
  // available count here.
  // Strings come from English-only WC; flag for i18n if the storefront
  // ever localises (the regex is keyed on English wording).
  const parseStockError = (errorMessage?: string): string | null => {
    if (!errorMessage) return null;

    const insufficient = errorMessage.match(
      /not have enough\s+"([^"]+)"\s+in stock.*?\((\d+)\s*[^)]*\)/i
    );
    if (insufficient) {
      const [, productName, available] = insufficient;
      const name = productName.trim();
      // "(0 available)" from this WC branch is structurally a pending-order
      // hold (true OOS hits the "is not in stock" branch above instead), but
      // hedge the wording so we don't falsely promise a retry if a plugin
      // reuses this phrasing with different semantics.
      if (available === "0") {
        return `"${name}" is currently unavailable — it may be held by another in-progress order, or out of stock. Please try again in a few minutes, or remove it from your cart.`;
      }
      return `Only ${available} of "${name}" left in stock — please reduce the quantity in your cart.`;
    }

    const outOfStock = errorMessage.match(/"([^"]+)"\s+is not in stock/i);
    if (outOfStock) {
      return `"${outOfStock[1]}" is out of stock. Please remove it from your cart.`;
    }

    if (
      errorMessage.toLowerCase().includes("out of stock") ||
      errorMessage.toLowerCase().includes("not in stock")
    ) {
      return "An item in your cart is out of stock. Please update your cart and try again.";
    }

    if (errorMessage.toLowerCase().includes("not have enough")) {
      return "There isn't enough stock for an item in your cart. Please reduce the quantity.";
    }

    return null;
  };

  const handleCheckoutError = async (error: any) => {
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
    // "Sorry, no session found." means the WC cart was empty server-side at
    // process_checkout time — it does NOT mean the user is logged out.
    // Redirecting to /login is wrong; recover the session/cart instead.
    if (error.message === "Sorry, no session found.") {
      // Use the return value — not the closed-over `cart` state, which is stale.
      let refreshedItemCount = cart?.contents?.itemCount ?? 0;
      try {
        const result = await refreshCart();
        refreshedItemCount = (result as any)?.data?.cart?.contents?.itemCount ?? refreshedItemCount;
      } catch {
        console.debug("refreshCart failed during session recovery — using last-known item count");
      }

      if (refreshedItemCount === 0) {
        toast.error("Your cart is empty. Please add items before checking out.");
        router.push("/cart");
        return;
      }

      toast.error("Session error — please reload the page to restore your cart.");
      return;
    }

    // Handle GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      const errorMessage = graphQLError.message || graphQLError.extensions?.message;

      const stockToast = parseStockError(errorMessage);
      if (stockToast) {
        toast.error(stockToast);
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

  // For pickup / flash / free shipping, strip only the (possibly stale)
  // shipping line from cart.total so coupons and fees stay in the quoted
  // total. Using cart.subtotal would drop percentage coupons. Assumes
  // shippingTax is 0 on this store (tax fields were trimmed from the cart
  // fragment as unused) — if shipping tax is ever configured, pickup totals
  // would still include it until that line is subtracted too.
  const serverOrderTotal = replaceStringinInt(cart?.total);
  const serverShippingTotal = replaceStringinInt(cart?.shippingTotal ?? "0");
  const chargeableOrderTotal =
    noShipping || preferFreeShipping
      ? Math.max(
          0,
          (Number.isFinite(serverOrderTotal) ? serverOrderTotal : 0) -
            (Number.isFinite(serverShippingTotal) ? serverShippingTotal : 0),
        )
      : serverOrderTotal;
  const cartSubtotal = replaceStringinInt(cart?.subtotal);
  const numericDiscountTotal = replaceStringinInt(cart?.discountTotal);
  const hasDiscount = Number.isFinite(numericDiscountTotal) && numericDiscountTotal > 0;

  // Card pricing now comes from WooCommerce alone: either a fee it attaches
  // once chosen_payment_method is synced, or the woo-price-tiers card price.
  // No site-side surcharge is added on top — one was never billed, so it only
  // ever quoted a total higher than the amount handed to the gateway.
  const backendFees = (cart?.fees ?? []).filter(
    (fee): fee is NonNullable<typeof fee> =>
      !!fee && Number.isFinite(fee.amount) && (fee.amount ?? 0) !== 0,
  );
  // Koko installment seam — currently identical to chargeableOrderTotal after
  // the financing markup was removed; kept named so a gateway fee can return
  // without rewiring the summary / prop plumbing.
  const kokoOrderTotal = chargeableOrderTotal;

  const orderTotalLabel = formatPrice(chargeableOrderTotal);

  // The courier's name changes with the destination — WC quotes "Local
  // Delivery" inside the Colombo distance zone and "Standard Shipping"
  // outstation — so name the service the customer is paying for instead of a
  // generic estimate line. CatLitter Delivery is quoted per address too, so it
  // reads its own rate rather than the courier one. Falls back to the generic
  // wording while the cart has no quote yet.
  const shippingRateLabel = useMemo(() => {
    if (preferFreeShipping) return "Free Shipping";
    if (deliveryType === "catlitter_delivery") {
      return resolveCatlitterDeliveryRate(cart)?.label || CATLITTER_DELIVERY_TITLE;
    }
    return resolveCourierRate(cart, preferFreeShipping)?.label || "Shipping estimate";
  }, [cart, deliveryType, preferFreeShipping]);

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

  const clearCartSafely = async () => {
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
  };

  const markRedirectPending = () => {
    redirectingRef.current = true;
    setRedirecting(true);
  };

  const handleOffsitePaymentStartFailure = async (
    orderDbId?: number | null,
  ) => {
    if (orderDbId) {
      await clearCartSafely();
      toast.error(
        "Your order was created, but payment could not be started. Please contact support — do not place the order again.",
      );
      return;
    }

    toast.error("Checkout failed. Please try again.");
  };

  const handleOffsitePaymentRedirect = async (redirectUrl: string) => {
    markRedirectPending();
    toast.success("Redirecting to payment gateway...");
    // Delay so the toast can paint before the document unloads.
    setTimeout(() => {
      window.location.assign(redirectUrl);
    }, 1000);
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
        apiUrl("/wp-json/api/gq_mobile/v1/upload"),
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
              totalPayment={chargeableOrderTotal}
              kokoTotal={kokoOrderTotal}
              setIsKokoPayment={setIsKokoPayment}
              isKokoPayment={isKokoPayment}
              onCheckoutSubmit={submitCheckout}
              onAddressChange={syncCheckoutAddress}
              onPaymentMethodChange={handlePaymentMethodChange}
              isTOC={isTOC}
              onTOCChange={handleTOC}
              tocError={tocError}
              // Disable the Confirm button while the checkout mutation, the
              // address push OR the shipping recalculation is in flight, so
              // the user can't submit at a stale total.
              loading={loading || totalsRecalculating || redirecting}
              // Separate from `loading`: the delivery options must not call a
              // rate unavailable while the address push that would quote it is
              // still in flight.
              ratesRecalculating={totalsRecalculating}
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
                  key={item?.key ?? index}
                  item={item as unknown as CartItem}
                  paymentGatewayId={selectedPaymentGatewayId}
                  pricesRecalculating={paymentSyncing}
                  onQuantityChange={updateCart}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200/70 pt-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 ">
              <CheckoutCouponField
                appliedCoupons={cart?.appliedCoupons}
                refreshCart={refreshCart}
                onSyncingChange={setIsCouponSyncingCart}
              />

              <div className="mt-5 space-y-2 text-sm" aria-busy={totalsRecalculating}>
                {/* Subtotal is the sum of the line prices as shown above it.
                    Catalog savings are itemised per product line ("Save X"),
                    not grossed up here and discounted back off. */}
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {totalsRecalculating ? (
                      <RecalculatingAmount />
                    ) : (
                      formatPrice(cartSubtotal)
                    )}
                  </span>
                </div>

                {hasDiscount && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 dark:text-green-400">You saved</span>
                    {totalsRecalculating ? (
                      <RecalculatingAmount className="h-5 w-16" />
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                        −{" "}
                        {formatPrice(numericDiscountTotal)}
                      </span>
                    )}
                  </div>
                )}

                {!noShipping && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {shippingRateLabel}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {totalsRecalculating ? (
                        <RecalculatingAmount />
                      ) : preferFreeShipping ? (
                        formatPrice(0)
                      ) : (
                        // The refreshed cart wins over the local state. Both
                        // hold a shipping figure, but only the cart's is
                        // re-read after every address sync — the local copy is
                        // whatever the last updateShippingMethod returned and
                        // never expires, so `shippingTotal || cart` let a
                        // superseded rate shadow the live one indefinitely.
                        // That is why the row disagreed with the order total
                        // (which tracks cart.total) until a reload cleared the
                        // state. Both arrive as WooCommerce's own "Rs450.00"
                        // string, so re-format — the rest of this summary is
                        // LKR.
                        formatPrice(
                          replaceStringinInt(cart?.shippingTotal || shippingTotal),
                        )
                      )}
                    </span>
                  </div>
                )}

                {backendFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-slate-600 dark:text-slate-400">
                      {fee.name}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {totalsRecalculating ? (
                        <RecalculatingAmount />
                      ) : (
                        <>
                          {(fee.amount ?? 0) > 0 ? "+" : "−"}
                          {formatPrice(Math.abs(fee.amount ?? 0))}
                        </>
                      )}
                    </span>
                  </div>
                ))}

              </div>
              {hasDiscount && (isCouponRestrictedPayment || isKokoPayment) && (
                <div className="flex justify-between py-2.5">
                  <span className="text-red-500 font-medium">Coupon discounts cannot be used with this payment method</span>
                </div>
              )}
              {isKokoPayment && (
                <div
                  className="flex flex-wrap items-center text-xs text-gray-500 mt-1"
                  aria-busy={totalsRecalculating}
                >
                  <span>pay in 3 x {currencySymbol}</span>
                  <span className="font-semibold mx-1">
                    {totalsRecalculating ? (
                      <RecalculatingAmount className="h-4 w-14" />
                    ) : (
                      (kokoOrderTotal / 3).toFixed(2)
                    )}
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

              <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100" aria-busy={totalsRecalculating}>
                <span className="text-base font-semibold">Order total</span>
                {totalsRecalculating ? (
                  <RecalculatingAmount className="h-7 w-32" />
                ) : (
                  <span className="text-xl font-bold">{orderTotalLabel}</span>
                )}
              </div>

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
