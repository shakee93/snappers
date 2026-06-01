"use client";

import { useQuery } from "@apollo/client";
import { GET_SINGLE_ORDER } from "@/graphql/defs/order";

/** Fetch a single order by its (base64) order ID. */
export function useOrderById(orderID: string) {
  return useQuery(GET_SINGLE_ORDER, {
    variables: { orderID },
  });
}
