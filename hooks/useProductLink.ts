import { Product } from "@/graphql/types/graphql";
import { useMemo } from "react";
import { getProductPath } from "@/lib/productUrl";

const useProductLink = (product?: Product | null) => {
  return useMemo(() => {
    if (!product) {
      return "";
    }

    return getProductPath(product);
  }, [product]);
};

export default useProductLink;
