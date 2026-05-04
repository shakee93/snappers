import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_PRODUCTS_BY_BOGO_TAG } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Deals",
  description: "Up to 75% off, Buy One Get One, and Free Gift deals at GQ Mobiles.",
};

// Safety-net ISR — primary invalidation is via revalidateTag('deals') from /api/revalidate.
export const revalidate = 300;

type DealProduct = SimpleProduct | VariableProduct;

const fetchByTag = (tagIn: string[]): Promise<DealProduct[]> =>
  getClient()
    .query({ query: GET_PRODUCTS_BY_BOGO_TAG, variables: { first: 20, tagIn } })
    .then((res) => (res.data?.products?.nodes ?? []) as DealProduct[])
    .catch(() => []);

const getDealsData = unstable_cache(
  async () => {
    const [clearance, bogo, freeGift] = await Promise.all([
      fetchByTag(["clearance"]),
      fetchByTag(["bogo-offer"]),
      fetchByTag(["free-gift"]),
    ]);
    return { clearance, bogo, freeGift };
  },
  ["deals-sliders"],
  { tags: ["deals"], revalidate: 300 }
);

async function DealsSliders() {
  const { clearance, bogo, freeGift } = await getDealsData();
  return (
    <>
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
    </>
  );
}

export default function DealsPage() {
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

          <Suspense>
            <DealsSliders />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
