"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_ORDERS, type GetMyOrdersQuery } from "@/graphql/defs/order";
import { GET_PRODUCTS_BY_DATABASE_IDS } from "@/graphql/defs/products";
import {
  collectOrderProductIds,
  enrichOrdersWithCatalog,
} from "@/components/account/accountOrderUtils";

/** Current customer's order history. */
export function useMyOrders() {
  const ordersQuery = useQuery<GetMyOrdersQuery>(GET_MY_ORDERS, {
    errorPolicy: "all",
  });

  const productIds = useMemo(
    () => collectOrderProductIds(ordersQuery.data?.customer?.orders?.nodes),
    [ordersQuery.data?.customer?.orders?.nodes],
  );

  const catalogQuery = useQuery(GET_PRODUCTS_BY_DATABASE_IDS, {
    variables: { ids: productIds },
    skip: productIds.length === 0,
    errorPolicy: "all",
  });

  const data = useMemo(
    () =>
      enrichOrdersWithCatalog(
        ordersQuery.data,
        catalogQuery.data?.products?.nodes,
      ),
    [catalogQuery.data?.products?.nodes, ordersQuery.data],
  );

  return {
    ...ordersQuery,
    data,
    loading: ordersQuery.loading,
  };
}
