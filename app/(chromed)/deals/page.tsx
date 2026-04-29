import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_PRODUCTS_BY_BOGO_TAG } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deals",
  description:
    "Browse Up to 75% off, Buy One Get One, and Free Gift deals at GQ Mobiles.",
};

const getDealsData = async () => {
  const [clearance, bogo, freeGift] = await Promise.all([
    getClient()
      .query({
        query: GET_PRODUCTS_BY_BOGO_TAG,
        variables: { first: 20, tagIn: ["clearance"] },
      })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
    getClient()
      .query({
        query: GET_PRODUCTS_BY_BOGO_TAG,
        variables: { first: 20, tagIn: ["bogo-offer"] },
      })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
    getClient()
      .query({
        query: GET_PRODUCTS_BY_BOGO_TAG,
        variables: { first: 20, tagIn: ["free-gift"] },
      })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
  ]);

  const prioritizeInStock = (items: (SimpleProduct & VariableProduct)[]) => {
    const inStock = items.filter((p) => p.stockStatus === "IN_STOCK");
    const soldOut = items.filter((p) => p.stockStatus !== "IN_STOCK");
    return [...inStock, ...soldOut];
  };

  return {
    clearance: prioritizeInStock(clearance as (SimpleProduct & VariableProduct)[]),
    bogo: prioritizeInStock(bogo as (SimpleProduct & VariableProduct)[]),
    freeGift: prioritizeInStock(freeGift as (SimpleProduct & VariableProduct)[]),
  };
};

export default async function DealsPage() {
  const { clearance, bogo, freeGift } = await getDealsData();

  return (
    <main>
      <div className="nc-PageHome relative flex flex-col overflow-hidden">
        <div className="flex flex-col px-3 gap-8 lg:gap-10 sm:container sm:max-w-screen-2xl py-8 lg:py-12">
          <div className="max-w-screen-md">
            <h1 className="block capitalize text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Deals
            </h1>
            <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              Explore the best savings, BOGO offers, and free gift promotions in one place.
            </span>
          </div>

          <SectionSliderProductCard
            products={clearance}
            heading="Up to 75% off"
            link="/tag/clearance"
          />

          <SectionSliderProductCard
            products={bogo}
            heading="Buy One Get One"
            link="/tag/bogo-offer"
          />

          <SectionSliderProductCard
            products={freeGift}
            heading="Free Gift"
            link="/tag/free-gift"
          />
        </div>
      </div>
    </main>
  );
}
