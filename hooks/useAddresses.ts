"use client";

import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_ADDRESSES, UPDATE_ADDRESS } from "@/graphql/defs/order";

/** Customer billing/shipping addresses: lazy fetch + update mutation. */
export function useAddresses() {
  const [getAddresses, { loading, data, error }] = useLazyQuery(GET_ADDRESSES, {
    fetchPolicy: "no-cache",
  });
  const [updateAddress] = useMutation(UPDATE_ADDRESS);
  return { getAddresses, loading, data, error, updateAddress };
}
