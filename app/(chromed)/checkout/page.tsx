/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Input from "shared/Input/Input";
import Label from "@/components/global/primitives/Label/Label";
import Link from "next/link";
import { BRAND_CTA_BUTTON_CLASS } from "shared/Button/ButtonBrand";
import { useApolloClient } from "@apollo/client";
import { useCart } from "@/context/CartProvider";
import { GET_CART } from "@/graphql/defs/cart";
import { useCoupon } from "@/hooks/useCoupon";
import { useShipping } from "@/hooks/useShipping";
import { useCheckoutAddressSync } from "@/hooks/useCheckoutAddressSync";
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
import { CARD_SURCHARGE_RATE } from "@/lib/checkoutMath";
import { apiUrl } from "@/lib/api";
import { enrichCheckoutOrderStorage } from "@/components/account/accountOrderUtils";

// Methods that represent "customer collects", never a courier rate.
const PICKUP_METHOD_IDS = new Set(["pickup_location", "local_pickup"]);

/**
 * The courier rate is not a constant on this store. Its id *and* its label
 * change with the destination — the distance/weight method quotes
 * `dwbs:1:distance` "Local Delivery" inside the Colombo zone and
 * `dwbs:1:weight` "Standard Shipping" outstation — so a hard-coded id is
 * rejected outright ("… is not an available shipping method for shipping
 * package …") and the cart silently keeps the rate quoted for the previous
 * address. Read it off the rates WooCommerce returned for the address it
 * currently holds instead.
 */
const resolveCourierRate = (cart: Cart | null | undefined, preferFree: boolean) => {
  const rates = cart?.availableShippingMethods?.[0]?.rates ?? [];
  const courierRates = rates.filter(
    (rate): rate is NonNullable<typeof rate> =>
      !!rate?.id && !PICKUP_METHOD_IDS.has(rate.methodId ?? ""),
  );

  if (preferFree) {
    const free = courierRates.find(
      (rate) => rate.methodId === "free_shipping" || Number(rate.cost) === 0,
    );
    if (free) return free;
  }

  return courierRates[0] ?? null;
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

  const [shippingTotal, setShippingTotal] = useState<string | null | undefined>();
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

  const { applyCouponMutation, removeCouponsMutation, applyingCoupon, removingCoupon } = useCoupon();

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
    if (cart?.shippingTotal != null) {
      setShippingTotal(cart.shippingTotal);
    }
  }, [cart, hasSeenCartWithItems, isCouponSyncingCart, applyingCoupon, removingCoupon]);

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

    const hasFreeShipping: any = rateSource?.appliedCoupons?.some(
      (coupon) => coupon?.code === "free-shipping"
    );
    if (hasFreeShipping) {
      setFreeShipping(true);
    }

    shippingAbortRef.current?.abort();
    const controller = new AbortController();
    shippingAbortRef.current = controller;

    try {
      // Mirror the mapping in getShippingMethod: store_pickup uses the
      // block-based pickup_location, flash_delivery uses the zone-bound
      // flat_rate:4 (free, configured backend-side as "Flash Delivery
      // (Uber/PickMe)"). Courier falls through to whichever rate the store
      // quoted for the current address — see resolveCourierRate.
      const shippingMethods =
        deliveryType === "flash_delivery"
          ? "flat_rate:4"
          : deliveryType === "store_pickup"
            ? "pickup_location:0"
            : resolveCourierRate(rateSource, hasFreeShipping || freeShipping)?.id;

      // No courier rate means the address doesn't resolve to a serviceable
      // zone yet. Selecting nothing is correct — the cart keeps whatever WC
      // last quoted, and the summary is already showing that.
      if (!shippingMethods) {
        return;
      }

      const total: any = rateSource?.total;
      setOrderTotal(freeShipping ? rateSource?.subtotal : total);

      if (customer?.id === "guest") {
        const subtotal: any = rateSource?.subtotal;

        if (noShipping || freeShipping) {
          setOrderTotal(subtotal);
        } else {
          setOrderTotal(total);
        }
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
        const { total, shippingTotal, subtotal } = updatedCart;
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

  // Totals are mid-flight while either the address push or the rate lookup is
  // running — the summary skeletons and the Confirm button both key off this.
  const totalsRecalculating = shippingUpdating || addressSyncing;

  useEffect(() => {
    // Skip until the cart has actually loaded. Firing the WBS mutation
    // against an empty/unready cart on first paint produces a hung/error
    // state that froze the page on the first add-to-cart → /checkout flow.
    if (!cart?.contents?.itemCount) return;
    updateShippingTotal().then((r) => r);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit the unstable mutation fn ref
  }, [deliveryType, freeShipping, cart?.contents?.itemCount]);

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
            ...(orderDeliveryType
              ? [{ key: "delivery_type", value: orderDeliveryType }]
              : []),
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

    // store_pickup → block-based pickup_location method (instance 0).
    // flash_delivery → zone-bound flat_rate instance 4 ("Flash Delivery
    // (Uber/PickMe)" at cost 0). Configured via WooCommerce > Settings >
    // Shipping > Sri Lanka. Different mechanism from store pickup, but
    // both resolve to a free shipping line — and flat_rate keeps the
    // title verbatim so order admin shows "Flash Delivery (Uber/PickMe)"
    // instead of the pickup_location plugin's "<title> (<location>)" template.
    // Courier: same dynamic rate as the cart-side lookup. Falling back to the
    // configured constant keeps the order writable if the cart somehow has no
    // rates to read, but the resolved id is what the store actually quoted.
    const courierRate = resolveCourierRate(cart, freeShipping);

    const methodId =
      orderDeliveryType === "flash_delivery"
        ? "flat_rate:4"
        : orderDeliveryType === "store_pickup"
          ? "pickup_location:0"
          : courierRate?.id ??
            (freeShipping
              ? siteConfig.shipping.freeShippingMethodId
              : siteConfig.shipping.weightBasedShippingMethodId);

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
        : courierRate?.label ??
          (freeShipping ? "Free Shipping" : "Weight Based Shipping");

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
  const threePercentFromTotal = numericOrderTotal * CARD_SURCHARGE_RATE;
  const TotalWithKoko = (cartSubtotal / 88) * 100;
  const taxWithTotal = (numericOrderTotal + threePercentFromTotal).toFixed(2);

  // Real shipping amount for Koko's installment math. Was hardcoded at 500
  // LKR which silently disagreed with the actual courier rate the rest of
  // the page renders. Source the same value the cart shows; fall back to
  // 500 only if the cart hasn't loaded yet.
  // Note: 0 is a valid loaded value when the cart contains a free-shipping
  // product (plugin zeros the rate) or has the free-shipping coupon applied,
  // so we cannot reject it with `> 0` — that would overcharge Koko by 500.
  const kokoShippingAmount = (() => {
    if (noShipping) return 0;
    if (cart?.shippingTotal != null) {
      const fromCart = replaceStringinInt(cart.shippingTotal);
      if (Number.isFinite(fromCart)) return fromCart;
    }
    const rateCost = cart?.availableShippingMethods?.[0]?.rates?.[0]?.cost;
    if (rateCost != null) {
      const fromRate = typeof rateCost === "string" ? parseFloat(rateCost) : Number(rateCost);
      if (Number.isFinite(fromRate)) return fromRate;
    }
    return 500;
  })();
  const kokoOrderTotal = TotalWithKoko + kokoShippingAmount;

  const orderTotalLabel = isCardPayment
    ? formatPrice(numericOrderTotal + threePercentFromTotal)
    : isKokoPayment
    ? formatPrice(kokoOrderTotal)
    : formatPrice(numericOrderTotal);

  // The courier's name changes with the destination — WC quotes "Local
  // Delivery" inside the Colombo distance zone and "Standard Shipping"
  // outstation — so name the service the customer is paying for instead of a
  // generic estimate line. Falls back to the generic wording while the cart
  // has no quote yet.
  const shippingRateLabel = useMemo(() => {
    if (freeShipping) return "Free Shipping";
    return resolveCourierRate(cart, freeShipping)?.label || "Shipping estimate";
  }, [cart, freeShipping]);

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
              setIsCardPayment={setIsCardPayment}
              isCardPayment={isCardPayment}
              totalPayment={numericOrderTotal}
              kokoTotal={kokoOrderTotal}
              setIsKokoPayment={setIsKokoPayment}
              isKokoPayment={isKokoPayment}
              onCheckoutSubmit={submitCheckout}
              onAddressChange={syncCheckoutAddress}
              isTOC={isTOC}
              onTOCChange={handleTOC}
              tocError={tocError}
              // Disable the Confirm button while the checkout mutation, the
              // address push OR the shipping recalculation is in flight, so
              // the user can't submit at a stale total.
              loading={loading || totalsRecalculating}
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
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${BRAND_CTA_BUTTON_CLASS}`}
                  >
                    {applyingCoupon ? (
                      <Loader className="w-4 h-4 animate-spin text-header-green" />
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
                              ({formatPrice(replaceStringinInt(applied.discountAmount))}{" "}
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
                      ? formatPrice(cartSubtotal + catalogSavings)
                      : formatPrice(cartSubtotal)}
                  </span>
                </div>

                {catalogSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Promotion <span className="text-xs font-semibold text-success ">(You saved)</span></span>
                    <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      -{formatPrice(catalogSavings)}
                    </span>
                  </div>
                )}

                {hasDiscount && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Coupon</span>
                    <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      −{" "}
                      {formatPrice(numericDiscountTotal)}
                    </span>
                  </div>
                )}

                {!noShipping && (
                  <div className="flex justify-between" aria-busy={totalsRecalculating}>
                    <span className="text-slate-600 dark:text-slate-400">
                      {shippingRateLabel}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {totalsRecalculating ? (
                        <span className="inline-block w-20 h-5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse align-middle" />
                      ) : freeShipping ? (
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
              </div>
              {(isCardPayment || isKokoPayment) && (
                <div className="flex justify-between py-2.5">
                  <span className="text-red-500 font-medium">Sorry you missed the discount</span>
                </div>
              )}
              {isKokoPayment && (
                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1">
                  <span>pay in 3 x {currencySymbol}</span>
                  <span className="font-semibold mx-1">
                    {(kokoOrderTotal / 3).toFixed(2)}
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
                <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100" aria-busy={totalsRecalculating}>
                  <span className="text-base font-semibold">Order total</span>
                  {totalsRecalculating ? (
                    <span className="inline-block w-32 h-7 rounded bg-slate-200 dark:bg-slate-700 animate-pulse align-middle" />
                  ) : (
                    <span
                      className="text-xl font-bold"
                      dangerouslySetInnerHTML={{
                        __html: formatPrice(numericOrderTotal + threePercentFromTotal),
                      }}
                    />
                  )}
                </div>
              )}

              {isKokoPayment && (
                <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100" aria-busy={totalsRecalculating}>
                  <span className="text-base font-semibold">Order total</span>
                  {totalsRecalculating ? (
                    <span className="inline-block w-32 h-7 rounded bg-slate-200 dark:bg-slate-700 animate-pulse align-middle" />
                  ) : (
                    <span
                      className="text-xl font-bold"
                      dangerouslySetInnerHTML={{
                        __html: formatPrice(kokoOrderTotal),
                      }}
                    />
                  )}
                </div>
              )}

              {!isCardPayment && !isKokoPayment && (
                <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-slate-100" aria-busy={totalsRecalculating}>
                  <span className="text-base font-semibold">Order total</span>
                  {totalsRecalculating ? (
                    <span className="inline-block w-32 h-7 rounded bg-slate-200 dark:bg-slate-700 animate-pulse align-middle" />
                  ) : (
                    <span className="text-xl font-bold">
                      {formatPrice(numericOrderTotal)}
                    </span>
                  )}
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
