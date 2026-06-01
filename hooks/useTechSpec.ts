"use client";

import { useLazyQuery } from "@apollo/client";
import { GET_TECH_SPEC } from "@/graphql/defs/products";

/** Lazy-load a product's technical spec table (quick view). */
export function useTechSpec() {
  return useLazyQuery(GET_TECH_SPEC);
}
