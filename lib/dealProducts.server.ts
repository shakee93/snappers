import { getClient } from "@/graphql/apollo-ssr";
import { GET_HOMEPAGE_DEAL_PRODUCTS } from "@/graphql/defs/products";
import { DEALS_CACHE_TAG } from "@/lib/cache-tags";
import { DEALS_PAGE_FETCH_FIRST, type DealProduct } from "@/lib/dealProducts";
import { unstable_cache } from "next/cache";

const DEAL_PRODUCTS_QUERY_CONTEXT = {
  fetchOptions: {
    next: { tags: [DEALS_CACHE_TAG], revalidate: 300 },
  },
};

/** In-stock on-sale products - same source as the homepage deals carousel. */
export const getDealProductsCached = unstable_cache(
  () =>
    getClient()
      .query({
        query: GET_HOMEPAGE_DEAL_PRODUCTS,
        variables: { first: DEALS_PAGE_FETCH_FIRST },
        context: DEAL_PRODUCTS_QUERY_CONTEXT,
      })
      .then((res) => (res.data?.products?.nodes ?? []) as DealProduct[])
      .catch((error: unknown) => {
        console.error("[getDealProductsCached] GraphQL query failed:", error);
        throw error;
      }),
  ["deal-products-v1"],
  { tags: [DEALS_CACHE_TAG], revalidate: 300 },
);
