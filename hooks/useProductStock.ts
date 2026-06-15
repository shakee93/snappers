"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCT_STOCK } from "@/graphql/defs/products";

/**
 * Fetches live stock from WP on the client so the PDP reflects WooCommerce
 * updates even when the SSR fetch-cache entry is stale (missed webhook, local
 * dev, etc.). Add-to-cart still re-validates at cart time.
 */
export function useProductStock(slug: string | null | undefined) {
  const { data } = useQuery(GET_PRODUCT_STOCK, {
    variables: { productId: slug },
    skip: !slug,
    fetchPolicy: "network-only",
  });

  const product = data?.product;

  const variationStockById = useMemo(() => {
    const map = new Map<
      number,
      { stockStatus?: string | null; stockQuantity?: number | null }
    >();
    const nodes = product?.variations?.nodes ?? [];
    for (const node of nodes) {
      if (node?.databaseId != null) {
        map.set(node.databaseId, node);
      }
    }
    return map;
  }, [product]);

  const getVariationStockStatus = useCallback(
    (databaseId: number | null | undefined) => {
      if (databaseId == null) return undefined;
      return variationStockById.get(databaseId)?.stockStatus ?? undefined;
    },
    [variationStockById],
  );

  const simpleStockStatus = product?.stockStatus ?? undefined;

  return {
    simpleStockStatus,
    getVariationStockStatus,
  };
}
