"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCT_LISTING_IMAGES_BY_IDS } from "@/graphql/defs/products";

/** Batch-fetch parent + variation images for listing cards (Typesense backfill). */
export function useProductListingImages(productIds: number[]) {
  return useQuery(GET_PRODUCT_LISTING_IMAGES_BY_IDS, {
    variables: { ids: productIds },
    skip: productIds.length === 0,
    fetchPolicy: "cache-first",
  });
}
