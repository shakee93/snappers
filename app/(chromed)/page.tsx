import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_ALL_BRANDS,
  GET_BROWSE_CATEGORY_TABS,
  GET_BROWSE_SECTION_PRODUCTS,
  GET_SHOP_BY_CATEGORIES,
} from "@/graphql/defs/products";
import {
  GET_HERO_DEALS_DATE,
  GET_HERO_SETTINGS,
  GET_HERO_SLIDER_SETTINGS,
  GET_HERO_SLIDES,
} from "@/graphql/defs/slides";
import {
  mapGraphqlHeroSlides,
  normalizeAcfHeroSlides,
} from "@/lib/heroSlides";
import {
  GET_SITE_SETTINGS,
  type SiteSettingFields,
} from "@/graphql/defs/site-settings";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import SectionHeroPets, {
  type HeroSettingsFields,
} from "@/components/home/SectionHeroPets";
import SectionShopByCategory, {
  type SectionShopByCategoryProps,
} from "@/components/home/SectionShopByCategory";
import SectionDealCountdown from "@/components/home/SectionDealCountdown";
import SectionDealProducts from "@/components/home/SectionDealProducts";
import SectionHealthProducts, {
  hasHealthSectionProducts,
} from "@/components/home/SectionHealthProducts";
import SectionBrowseProducts, {
  type BrowseInitialCache,
} from "@/components/home/SectionBrowseProducts";
import { GET_NAV_CATEGORIES } from "@/graphql/defs/nav";
import {
  buildBrowseCategoryScopeMap,
  BROWSE_CATEGORY_TAB_SSR_FIRST,
  resolveBrowseCategoryTabs,
} from "@/lib/browseCategories";
import { getDealProductsCached } from "@/lib/dealProducts.server";
import {
  pickHomepageDealProducts,
  type DealProduct,
} from "@/lib/dealProducts";
import SectionBrandMarquee, {
  type BrandMarqueeItem,
} from "@/components/home/SectionBrandMarquee";
import { type CategoryTreeNode } from "@/lib/categoryScope";
import { unstable_cache } from "next/cache";
import {
  BROWSE_PRODUCTS_CACHE_TAG,
  DEAL_COUNTDOWN_CACHE_TAG,
  HERO_SECTION_CACHE_TAG,
  SITE_SETTINGS_CACHE_TAG,
} from "@/lib/cache-tags";

// ISR safety net: the WP → /api/revalidate webhook is the primary cache buster,
// but this ensures the homepage (slides, reviews, etc.) self-heals if a webhook
// is missed - and lets local dev pick up fresh data without clearing .next.
export const revalidate = 1800;

type BrowseCategoryTab = CategoryTreeNode & {
  id: string;
  databaseId?: number | null;
  name?: string | null;
  slug?: string | null;
  parentDatabaseId?: number | null;
  image?: { sourceUrl?: string | null } | null;
};

const HERO_QUERY_CONTEXT = {
  fetchOptions: { next: { tags: [HERO_SECTION_CACHE_TAG] } },
};

const SITE_SETTINGS_QUERY_CONTEXT = {
  fetchOptions: { next: { tags: [SITE_SETTINGS_CACHE_TAG] } },
};

const DEAL_COUNTDOWN_QUERY_CONTEXT = {
  fetchOptions: {
    next: {
      tags: [DEAL_COUNTDOWN_CACHE_TAG, HERO_SECTION_CACHE_TAG],
      revalidate: 300,
    },
  },
};

const BROWSE_PRODUCTS_QUERY_CONTEXT = {
  fetchOptions: { next: { tags: [BROWSE_PRODUCTS_CACHE_TAG] } },
};

const getHeroSlidesCached = unstable_cache(
  () =>
    getClient()
      .query({ query: GET_HERO_SLIDES, context: HERO_QUERY_CONTEXT })
      .then((res) => res.data?.heroSlides?.nodes ?? [])
      .catch(() => []),
  ["homepage-hero-slides-v2"],
  { tags: [HERO_SECTION_CACHE_TAG], revalidate: 86400 },
);

const getHeroSettingsCached = unstable_cache(
  () =>
    getClient()
      .query({ query: GET_HERO_SETTINGS, context: HERO_QUERY_CONTEXT })
      .then((res) => res.data?.heroSettings?.heroSettingsFields ?? null)
      .catch(() => null),
  ["homepage-hero-settings-v6"],
  { tags: [HERO_SECTION_CACHE_TAG], revalidate: 86400 },
);

const getHeroSliderSettingsCached = unstable_cache(
  () =>
    getClient()
      .query({
        query: GET_HERO_SLIDER_SETTINGS,
        context: {
          fetchOptions: {
            next: {
              tags: [HERO_SECTION_CACHE_TAG, DEAL_COUNTDOWN_CACHE_TAG],
              revalidate: 300,
            },
          },
        },
      })
      .then(
        (res) =>
          res.data?.heroSettings?.heroSettingsFields?.sliderSettings ?? null,
      )
      .catch(() => null),
  ["homepage-hero-slider-settings-v1"],
  { tags: [HERO_SECTION_CACHE_TAG], revalidate: 300 },
);

const getHeroDealsDateCached = unstable_cache(
  () =>
    getClient()
      .query({
        query: GET_HERO_DEALS_DATE,
        context: DEAL_COUNTDOWN_QUERY_CONTEXT,
      })
      .then(
        (res) =>
          res.data?.heroSettings?.heroSettingsFields?.dealsDate ?? null,
      )
      .catch(() => null),
  ["homepage-hero-deals-date-v1"],
  { tags: [DEAL_COUNTDOWN_CACHE_TAG, HERO_SECTION_CACHE_TAG], revalidate: 300 },
);

const getSiteSettingsCached = unstable_cache(
  () =>
    getClient()
      .query({
        query: GET_SITE_SETTINGS,
        context: SITE_SETTINGS_QUERY_CONTEXT,
      })
      .then((res) => res.data?.siteSettings?.siteSettingFields ?? null)
      .catch(() => null),
  ["homepage-site-settings-v2"],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 1800 }
);

const getData = async () => {
  const [
    heroSlideNodes,
    heroSettingsFromAcf,
    heroSliderSettings,
    heroDealsDate,
    siteSettings,
    categories,
    dealProducts,
    browseAllTab,
    browseCategories,
    navCategoriesFlat,
    brands,
  ] = await Promise.all([
    getHeroSlidesCached(),
    getHeroSettingsCached(),
    getHeroSliderSettingsCached(),
    getHeroDealsDateCached(),
    getSiteSettingsCached(),
    getClient()
      .query({ query: GET_SHOP_BY_CATEGORIES, variables: { first: 12 } })
      .then((res) => res.data?.productCategories?.nodes || [])
      .catch(() => []),
    getDealProductsCached().catch(() => []),
    getClient()
      .query({
        query: GET_BROWSE_SECTION_PRODUCTS,
        variables: { first: 100 },
        context: BROWSE_PRODUCTS_QUERY_CONTEXT,
      })
      .then((res) => ({
        products: res.data?.products?.nodes || [],
        hasNextPage: res.data?.products?.pageInfo?.hasNextPage ?? false,
        endCursor: res.data?.products?.pageInfo?.endCursor ?? null,
      }))
      .catch(() => ({
        products: [],
        hasNextPage: false,
        endCursor: null,
      })),
    getClient()
      .query({ query: GET_BROWSE_CATEGORY_TABS, variables: { first: 50 } })
      .then((res) => res.data?.productCategories?.nodes || [])
      .catch(() => []),
    getClient()
      .query({ query: GET_NAV_CATEGORIES })
      .then((res) => res.data?.productCategories?.nodes || [])
      .catch(() => []),
    getClient()
      .query({ query: GET_ALL_BRANDS })
      .then((res) => res.data?.brands?.nodes ?? [])
      .catch(() => []),
  ]);

  const browseCategoryTabs = resolveBrowseCategoryTabs(
    browseCategories as BrowseCategoryTab[],
    navCategoriesFlat as BrowseCategoryTab[],
  );
  const browseCategoryScopes = buildBrowseCategoryScopeMap(
    browseCategoryTabs,
    browseCategories as BrowseCategoryTab[],
  );

  const browseCategoryTabCacheEntries = await Promise.all(
    browseCategoryTabs
      .filter(
        (category): category is BrowseCategoryTab & { databaseId: number } =>
          typeof category.databaseId === "number"
      )
      .map(async (category) => {
        const scopeIds = browseCategoryScopes[category.databaseId];
        const categoryIdIn = scopeIds?.length
          ? scopeIds
          : [category.databaseId];

        const result = await getClient()
          .query({
            query: GET_BROWSE_SECTION_PRODUCTS,
            variables: {
              categoryIdIn,
              first: BROWSE_CATEGORY_TAB_SSR_FIRST,
            },
            context: BROWSE_PRODUCTS_QUERY_CONTEXT,
          })
          .catch(() => null);

        const cache: BrowseInitialCache = {
          products: result?.data?.products?.nodes ?? [],
          hasNextPage: result?.data?.products?.pageInfo?.hasNextPage ?? false,
          endCursor: result?.data?.products?.pageInfo?.endCursor ?? null,
        };

        return [category.databaseId, cache] as const;
      })
  );

  const browseCategoryTabCaches = Object.fromEntries(
    browseCategoryTabCacheEntries
  ) as Record<number, BrowseInitialCache>;

  const mappedHeroSlides = mapGraphqlHeroSlides(heroSlideNodes);
  const acfSlides = normalizeAcfHeroSlides(
    heroSliderSettings?.slides ??
      heroSettingsFromAcf?.sliderSettings?.slides ??
      [],
  );
  const homepageHeroSlides =
    acfSlides.length > 0 ? acfSlides : mappedHeroSlides;

  const heroSettings: HeroSettingsFields | null = {
    dealsDate: heroSettingsFromAcf?.dealsDate ?? null,
    sliderSettings: { slides: homepageHeroSlides },
    dealBannerSettings: heroSettingsFromAcf?.dealBannerSettings ?? null,
    healthSectionSettings: heroSettingsFromAcf?.healthSectionSettings ?? null,
  };

  return {
    heroSettings,
    heroDealsDate,
    siteSettings: siteSettings as SiteSettingFields | null,
    categories: categories as SectionShopByCategoryProps["categories"],
    dealProducts: dealProducts as (SimpleProduct & VariableProduct)[],
    browseAllTab: browseAllTab as BrowseInitialCache,
    browseCategoryTabs,
    browseCategoryScopes,
    browseCategoryTabCaches,
    brands: brands as BrandMarqueeItem[],
  };
};

export default async function Home() {
  const {
    heroSettings,
    heroDealsDate,
    siteSettings,
    categories,
    dealProducts,
    browseAllTab,
    browseCategoryTabs,
    browseCategoryScopes,
    browseCategoryTabCaches,
    brands,
  } = await getData();

  const homepageDeals = pickHomepageDealProducts(
    dealProducts as DealProduct[],
    (browseAllTab.products ?? []) as DealProduct[],
  );
  const hasHomepageDeals = homepageDeals.length > 0;
  const hasHealthSection = hasHealthSectionProducts(
    heroSettings?.healthSectionSettings,
  );
  const hasBlockBeforeBrowse = hasHomepageDeals || hasHealthSection;

  return (
    <main className="overflow-x-hidden">
      <div className="nc-PageHome relative flex flex-col overflow-x-hidden bg-white">
        <div className="z-0">
          <SectionHeroPets data={heroSettings} />
        </div>

        <div className="mt-2 md:mt-3">
          <SectionDealCountdown
            key={
              heroDealsDate ??
              heroSettings?.dealsDate ??
              siteSettings?.dealEnds ??
              "default"
            }
            endsAt={
              heroDealsDate ??
              heroSettings?.dealsDate ??
              siteSettings?.dealEnds ??
              undefined
            }
          />
        </div>

        {hasHomepageDeals ? (
          <div className="mt-6 md:mt-8">
            <SectionDealProducts products={homepageDeals} />
          </div>
        ) : null}

        <div className="mt-12 md:mt-16">
          <SectionShopByCategory categories={categories} />
        </div>

        {hasHealthSection ? (
          <div className="mt-10 md:mt-14">
            <SectionHealthProducts
              healthSectionSettings={heroSettings?.healthSectionSettings}
            />
          </div>
        ) : null}

        <div
          className={
            hasBlockBeforeBrowse ? "mt-10 md:mt-14" : "mt-6 md:mt-8"
          }
        >
          <SectionBrowseProducts
            initialAllTab={browseAllTab}
            initialCategoryTabCaches={browseCategoryTabCaches}
            categories={browseCategoryTabs}
            categoryScopeById={browseCategoryScopes}
          />
        </div>

        <SectionBrandMarquee brands={brands} />
      </div>
    </main>
  );
}
