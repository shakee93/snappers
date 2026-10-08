"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCT_STOCK } from "@/graphql/defs/products";

/** Poll interval for live stock updates while the user is on the PDP. */
const STOCK_POLL_MS = 60_000;

/**
 * Fetches and polls stock from WP on the client so the PDP reflects WooCommerce
 * updates even when the SSR fetch-cache entry is stale (missed webhook, local
 * dev, etc.). Add-to-cart still re-validates at cart time.
 *
 * Note: GET_PRODUCT_STOCK caps variations at 50 - variants beyond that fall
 * back to SSR stock status.
 */
export function useProductStock(slug: string | null | undefined) {
  const { data } = useQuery(GET_PRODUCT_STOCK, {
    variables: { productId: slug },
    skip: !slug,
    fetchPolicy: "network-only",
    pollInterval: STOCK_POLL_MS,
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
