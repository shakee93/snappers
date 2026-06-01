"use client";

import { useMutation } from "@apollo/client";
import { APPLY_COUPON, REMOVE_COUPONS } from "@/graphql/defs/cart";

/** Apply / remove cart coupons, with their in-flight loading flags. */
export function useCoupon() {
  const [applyCouponMutation, { loading: applyingCoupon }] =
    useMutation(APPLY_COUPON);
  const [removeCouponsMutation, { loading: removingCoupon }] =
    useMutation(REMOVE_COUPONS);
  return {
    applyCouponMutation,
    removeCouponsMutation,
    applyingCoupon,
    removingCoupon,
  };
}
