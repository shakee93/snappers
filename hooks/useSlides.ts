"use client";

import { useQuery } from "@apollo/client";
import { GET_SLIDES } from "@/graphql/defs/slides";

/** Homepage hero slides. */
export function useSlides() {
  return useQuery(GET_SLIDES);
}
