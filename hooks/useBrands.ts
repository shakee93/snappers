"use client";

import { useQuery } from "@apollo/client";
import { GET_BRANDS } from "@/graphql/defs/products";

/** All brands (homepage "More to explore" grid). */
export function useBrands() {
  return useQuery(GET_BRANDS);
}
