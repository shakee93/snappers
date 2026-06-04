"use client";

import { useQuery } from "@apollo/client";
import { GET_NAV_BRANDS } from "@/graphql/defs/nav";
import { Brand } from "@/graphql/types/graphql";

/** Brands list for the mega-menu nav. */
export function useNavBrands() {
  const { data, loading, error } = useQuery(GET_NAV_BRANDS);
  const brands: Brand[] = data?.brands?.nodes || [];
  return { brands, loading, error };
}
