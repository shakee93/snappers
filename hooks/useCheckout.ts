"use client";

import { useMutation } from "@apollo/client";
import {
  CHECKOUT,
  COMPLETE_ORDER_PAYMENT,
  GUEST_CHECKOUT,
  GUEST_CHECKOUT_MUTATION,
} from "@/graphql/defs/order";

/**
 * The four checkout mutations used by the checkout page: logged-in checkout,
 * complete-order-payment, guest checkout, and guest order creation. The gateway
 * selection logic stays in the page; this only owns the mutations.
 */
export function useCheckout() {
  const [
    checkoutMutation,
    {
      data: realCheckoutData,
      loading: realCheckoutLoading,
      error: realCheckoutError,
    },
  ] = useMutation(CHECKOUT);

  const [completeOrderPayment] = useMutation(COMPLETE_ORDER_PAYMENT);

  const [
    guestCheckout,
    { loading: guestCheckoutLoading, error: guestCheckoutError },
  ] = useMutation(GUEST_CHECKOUT);

  const [
    createOrderGuest,
    { loading: checkoutLoading, error: checkoutError, data: checkoutData },
  ] = useMutation(GUEST_CHECKOUT_MUTATION);

  return {
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
  };
}
