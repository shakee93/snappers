"use client";

import { useQuery } from "@apollo/client";
import { GET_CHECKOUT_USER_DETAILS } from "@/graphql/defs/order";

/** Logged-in customer's saved details used to prefill checkout. */
export function useCheckoutUserDetails() {
  return useQuery(GET_CHECKOUT_USER_DETAILS);
}
