"use client";

import { useLazyQuery } from "@apollo/client";
import { GET_BRAND_ARCHIVE } from "@/graphql/defs/products";

/** Lazy-load archive products filtered by brand/category (no-cache). */
export function useBrandArchive() {
  return useLazyQuery(GET_BRAND_ARCHIVE, {
    fetchPolicy: "no-cache",
  });
}
