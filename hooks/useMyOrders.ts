"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_ORDERS, type GetMyOrdersQuery } from "@/graphql/defs/order";

/** Current customer's order history. */
export function useMyOrders() {
  return useQuery<GetMyOrdersQuery>(GET_MY_ORDERS);
}
