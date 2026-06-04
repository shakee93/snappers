"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BOGO_PLUGIN_META } from "@/graphql/defs/products";

/** Batch-fetch BOGO plugin meta for the given product databaseIds. */
export function useBogoPluginMeta(productIds: number[]) {
  return useQuery(GET_PRODUCTS_BOGO_PLUGIN_META, {
    variables: { ids: productIds },
    skip: productIds.length === 0,
    fetchPolicy: "cache-first",
  });
}
