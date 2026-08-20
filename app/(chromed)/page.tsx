import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_ALL_BRANDS,
  GET_BROWSE_CATEGORY_TABS,
  GET_BROWSE_SECTION_PRODUCTS,
  GET_SHOP_BY_CATEGORIES,
} from "@/graphql/defs/products";
import { GET_HERO_SETTINGS } from "@/graphql/defs/slides";
import { GET_GOOGLE_REVIEWS } from "@/graphql/defs/reviews";
import {
  GET_SITE_SETTINGS,
  type SiteSettingFields,
} from "@/graphql/defs/site-settings";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import SectionHeroPets, {
  type HeroSettingsFields,
} from "@/components/home/SectionHeroPets";
import SectionFeatureBadges from "@/components/home/SectionFeatureBadges";
import SectionShopByCategory, {
  type SectionShopByCategoryProps,
} from "@/components/home/SectionShopByCategory";
import SectionDealCountdown from "@/components/home/SectionDealCountdown";
import SectionDealProducts from "@/components/home/SectionDealProducts";
import SectionHowToOrder from "@/components/home/SectionHowToOrder";
import SectionHealthProducts from "@/components/home/SectionHealthProducts";
import SectionBrowseProducts, {
  type BrowseInitialCache,
} from "@/components/home/SectionBrowseProducts";
import {
  buildBrowseCategoryScopeMap,
  BROWSE_CATEGORY_TAB_SSR_FIRST,
  filterBrowseCategoryTabs,
} from "@/lib/browseCategories";
import { getDealProductsCached } from "@/lib/dealProducts.server";
import { HOMEPAGE_DEAL_CAROUSEL_LIMIT } from "@/lib/dealProducts";
import SectionGoogleReviews, {
  type GoogleReviewsFields,
} from "@/components/home/SectionGoogleReviews";
import SectionBrandMarquee, {
  type BrandMarqueeItem,
} from "@/components/home/SectionBrandMarquee";
import SectionOurStores from "@/components/home/SectionOurStores";
import { type CategoryTreeNode } from "@/lib/categoryScope";
import { unstable_cache } from "next/cache";
import {
  HERO_SECTION_CACHE_TAG,
  SITE_SETTINGS_CACHE_TAG,
} from "@/lib/cache-tags";

// ISR safety net: the WP → /api/revalidate webhook is the primary cache buster,
// but this ensures the homepage (slides, reviews, etc.) self-heals if a webhook
// is missed — and lets local dev pick up fresh data without clearing .next.
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

const getHeroSettingsCached = unstable_cache(
  () =>
    getClient()
      .query({ query: GET_HERO_SETTINGS, context: HERO_QUERY_CONTEXT })
      .then((res) => res.data?.heroSettings?.heroSettingsFields ?? null)
      .catch(() => null),
  ["homepage-hero-settings-v3"],
  { tags: [HERO_SECTION_CACHE_TAG], revalidate: 86400 }
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
  ["homepage-site-settings-v1"],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 1800 }
);

const getData = async () => {
  const [
    heroSettings,
    siteSettings,
    categories,
    dealProducts,
    browseAllTab,
    browseCategories,
    googleReviews,
    brands,
  ] = await Promise.all([
    getHeroSettingsCached(),
    getSiteSettingsCached(),
    getClient()
      .query({ query: GET_SHOP_BY_CATEGORIES, variables: { first: 12 } })
      .then((res) => res.data?.productCategories?.nodes || [])
      .catch(() => []),
    getDealProductsCached().catch(() => []),
    getClient()
      .query({ query: GET_BROWSE_SECTION_PRODUCTS, variables: { first: 100 } })
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
      .query({ query: GET_BROWSE_CATEGORY_TABS, variables: { first: 20 } })
      .then((res) => res.data?.productCategories?.nodes || [])
      .catch(() => []),
    getClient()
      .query({ query: GET_GOOGLE_REVIEWS })
      .then((res) => res.data?.googleReviews?.googleReviewsFields ?? null)
      .catch(() => null),
    getClient()
      .query({ query: GET_ALL_BRANDS })
      .then((res) => res.data?.brands?.nodes ?? [])
      .catch(() => []),
  ]);

  const browseCategoryTabs = filterBrowseCategoryTabs(
    browseCategories as BrowseCategoryTab[]
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

  return {
    heroSettings: heroSettings as HeroSettingsFields | null,
    siteSettings: siteSettings as SiteSettingFields | null,
    categories: categories as SectionShopByCategoryProps["categories"],
    dealProducts: dealProducts as (SimpleProduct & VariableProduct)[],
    browseAllTab: browseAllTab as BrowseInitialCache,
    browseCategoryTabs,
    browseCategoryScopes,
    browseCategoryTabCaches,
    googleReviews: googleReviews as GoogleReviewsFields | null,
    brands: brands as BrandMarqueeItem[],
  };
};

export default async function Home() {
  const {
    heroSettings,
    siteSettings,
    categories,
    dealProducts,
    browseAllTab,
    browseCategoryTabs,
    browseCategoryScopes,
    browseCategoryTabCaches,
    googleReviews,
    brands,
  } = await getData();

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
          <SectionDealCountdown endsAt={siteSettings?.dealEnds ?? undefined} />
        </div>

        <div className="mt-8 md:mt-10">
          <SectionDealProducts
            products={dealProducts.slice(0, HOMEPAGE_DEAL_CAROUSEL_LIMIT)}
          />
        </div>

        <SectionHowToOrder className="mt-16 md:mt-24" />

        <div className="mt-16 md:mt-24">
          <SectionHealthProducts
            healthSectionSettings={heroSettings?.healthSectionSettings}
          />
        </div>

        <div className="mt-16 md:mt-24">
          <SectionBrowseProducts
            initialAllTab={browseAllTab}
            initialCategoryTabCaches={browseCategoryTabCaches}
            categories={browseCategoryTabs}
            categoryScopeById={browseCategoryScopes}
          />
        </div>

        <div className="mt-16 md:mt-24">
          <SectionGoogleReviews data={googleReviews} />
        </div>

        <SectionBrandMarquee brands={brands} />

        <SectionOurStores />
      </div>
    </main>
  );
}
