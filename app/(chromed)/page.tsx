import SectionSliderProductCard from "@/components/global/ui/SectionSliderProductCard";
import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_BRANDS,
  GET_HOMEPAGE_DEAL_PRODUCTS,
  GET_PRODUCTS_BY_BOGO_TAG,
  GET_PRODUCTS_NODES,
  GET_PRODUCTS_NODES_HOMEPAGE,
  GET_SHOP_BY_CATEGORIES,
} from "@/graphql/defs/products";
import { GET_HERO_SETTINGS } from "@/graphql/defs/slides";
import { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import SectionSliderBrandCard from "@/components/global/ui/SectionSliderBrandCard";
import CardSkeleton from "@/components/global/primitives/Skeletons/CardSkeleton";
import SectionHeroPets, {
  type HeroSettingsFields,
} from "@/components/home/SectionHeroPets";
import SectionFeatureBadges from "@/components/home/SectionFeatureBadges";
import SectionShopByCategory, {
  type SectionShopByCategoryProps,
} from "@/components/home/SectionShopByCategory";
import SectionDealCountdown from "@/components/home/SectionDealCountdown";
import SectionDealProducts from "@/components/home/SectionDealProducts";
import SectionHealthProducts from "@/components/home/SectionHealthProducts";
import { unstable_cache } from "next/cache";
import { HERO_SECTION_CACHE_TAG } from "@/lib/cache-tags";

// ISR safety net: the WP → /api/revalidate webhook is the primary cache buster,
// but this ensures the homepage (slides, reviews, etc.) self-heals if a webhook
// is missed — and lets local dev pick up fresh data without clearing .next.
export const revalidate = 1800;

const BOGO_OFFER_TAG_SLUGS = ["bogo-offer"];

const HERO_QUERY_CONTEXT = {
  fetchOptions: { next: { tags: [HERO_SECTION_CACHE_TAG] } },
};

const getHeroSettingsCached = unstable_cache(
  () =>
    getClient()
      .query({ query: GET_HERO_SETTINGS, context: HERO_QUERY_CONTEXT })
      .then((res) => res.data?.heroSettings?.heroSettingsFields ?? null)
      .catch(() => null),
  ["homepage-hero-settings-v3"],
  { tags: [HERO_SECTION_CACHE_TAG], revalidate: 86400 }
);

const getData = async () => {
  const queries = [
    getClient()
      .query({
        query: GET_PRODUCTS_BY_BOGO_TAG,
        variables: { first: 20, tagIn: BOGO_OFFER_TAG_SLUGS },
      })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
    getClient()
      .query({ query: GET_PRODUCTS_NODES, variables: { first: 25 } })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
    getClient()
      .query({
        query: GET_PRODUCTS_NODES_HOMEPAGE,
        variables: { first: 10, tagId: 536 },
      })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
    getClient()
      .query({ query: GET_BRANDS })
      .then((res) => res.data?.brands?.nodes || [])
      .catch(() => []),
    getHeroSettingsCached(),
    getClient()
      .query({ query: GET_SHOP_BY_CATEGORIES, variables: { first: 12 } })
      .then((res) => res.data?.productCategories?.nodes || [])
      .catch(() => []),
    getClient()
      .query({ query: GET_HOMEPAGE_DEAL_PRODUCTS, variables: { first: 4 } })
      .then((res) => res.data?.products?.nodes || [])
      .catch(() => []),
  ];

  const [
    freeOffersRaw,
    newArrivals,
    backInStock,
    brands,
    heroSettings,
    categories,
    dealProducts,
  ] = await Promise.all(queries);

  return {
    freeOffersRaw: freeOffersRaw as (SimpleProduct & VariableProduct)[],
    newArrivals: newArrivals as (SimpleProduct & VariableProduct)[],
    backInStock: backInStock as (SimpleProduct & VariableProduct)[],
    brands: brands as Brand[],
    heroSettings: heroSettings as HeroSettingsFields | null,
    categories: categories as SectionShopByCategoryProps["categories"],
    dealProducts: dealProducts as (SimpleProduct & VariableProduct)[],
  };
};

export default async function Home() {
  const {
    freeOffersRaw,
    newArrivals,
    backInStock,
    brands,
    heroSettings,
    categories,
    dealProducts,
  } = await getData();

  const inStockOffers = freeOffersRaw.filter((p) => p.stockStatus === "IN_STOCK");
  const soldOutOffers = freeOffersRaw.filter((p) => p.stockStatus !== "IN_STOCK");
  const freeOffersProducts =
    inStockOffers.length >= 5
      ? inStockOffers
      : [...inStockOffers, ...soldOutOffers];

  return (
    <main className="overflow-x-hidden">
      <div className="nc-PageHome relative flex flex-col overflow-x-hidden bg-white">
        <div className="z-0">
          <SectionHeroPets data={heroSettings} />
          <SectionFeatureBadges />
        </div>

        <div className="mt-16 md:mt-24">
          <SectionShopByCategory categories={categories} />
        </div>

        <div className="mt-16 md:mt-24">
          <SectionDealCountdown />
        </div>

        <div className="mt-8 md:mt-10">
          <SectionDealProducts products={dealProducts} />
        </div>

        <div className="mt-16 md:mt-24">
          <SectionHealthProducts
            healthSectionSettings={heroSettings?.healthSectionSettings}
          />
        </div>

        <div className="flex flex-col px-3 gap-10 lg:gap-10 mx-auto w-full max-w-[1368px]">
          <div className="mt-5 md:mt-10">
            <SectionSliderProductCard
              products={newArrivals}
              heading="New Arrivals"
              link="new-arrivals"
            />
          </div>

          <div>
            <SectionSliderProductCard
              products={freeOffersProducts}
              heading="Free Offers"
              link="tag/bogo-offer"
            />
          </div>

          {brands ? (
            <SectionSliderBrandCard
              heading="Our Brands"
              link="brands"
              brands={brands}
            />
          ) : (
            <CardSkeleton />
          )}

          <div>
            <SectionSliderProductCard
              products={backInStock}
              heading="Back In Stock"
              link="back-in-stock"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
