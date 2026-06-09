"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_ORDERS } from "@/graphql/defs/order";

/** Current customer's order history. */
export function useMyOrders() {
  return useQuery(GET_MY_ORDERS);
}
