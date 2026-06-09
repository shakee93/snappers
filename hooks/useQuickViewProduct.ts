"use client";

import { useLazyQuery } from "@apollo/client";
import { GET_QUICK_VIEW_PRODUCT } from "@/graphql/defs/products";

/** Lazy-load the full product for the quick-view modal. */
export function useQuickViewProduct() {
  return useLazyQuery(GET_QUICK_VIEW_PRODUCT);
}
