"use client";

import { useMutation } from "@apollo/client";
import { UPDATE_SHIPPING_TOTAL } from "@/graphql/defs/cart";

/** Update the cart's shipping total (chosen delivery method). */
export function useShipping() {
  const [updateCartShippingTotalMutation, { loading: shippingUpdating }] =
    useMutation(UPDATE_SHIPPING_TOTAL);
  return { updateCartShippingTotalMutation, shippingUpdating };
}
