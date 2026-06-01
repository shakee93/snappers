"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_DATABASE_IDS } from "@/graphql/defs/products";

/**
 * Batch-fetch BOGO free-gift products by databaseId and return the named
 * (resolved) nodes. `enabled` mirrors the BOGO flag; the query is skipped when
 * off or when there are no ids. Deduplicates the identical block in
 * ProductDetails and FreeGiftPreview.
 */
export function useFreeGiftProducts(
  ids: number[],
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { data, loading } = useQuery(GET_PRODUCTS_BY_DATABASE_IDS, {
    variables: { ids },
    skip: !enabled || ids.length === 0,
    fetchPolicy: "cache-first",
  });

  const nodes = useMemo(
    () =>
      data?.products?.nodes?.filter(
        (p: { name?: string | null } | null): p is NonNullable<typeof p> =>
          !!p?.name,
      ) ?? [],
    [data],
  );

  return { nodes, loading };
}
