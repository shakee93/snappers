"use client";

import { useQuery } from "@apollo/client";
import { GET_PRICE_FLUCTUATION_NOTICE } from "@/graphql/defs/options";

/**
 * Top-bar "prices are being updated" notice flag. Returns both the boolean
 * (`isPriceFluctuation`) and the raw `data` (some callers pass the whole
 * object down to children that read `topBarPriceFluctuationNotice`).
 */
export function usePriceFluctuationNotice() {
  const { data, loading, error } = useQuery(GET_PRICE_FLUCTUATION_NOTICE);
  const isPriceFluctuation = data?.topBarPriceFluctuationNotice || false;
  return { isPriceFluctuation, data, loading, error };
}
