import { Suspense } from "react";
import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_ALL_PRODUCTS,
  GET_BROWSE_CATEGORY_TABS,
} from "@/graphql/defs/products";
import { GET_NESTED_CATEGORIES, GET_NAV_CATEGORIES } from "@/graphql/defs/nav";
import InstantSearchWrapper from "@/components/global/primitives/InstantSearchWrapper";
import ArchiveFilters from "@/components/global/primitives/archive/ArchiveFilters";
import TypesenseArchiveFilters from "@/components/global/primitives/archive/TypesenseArchiveFilters";
import ArchiveProductGrid from "@/components/global/primitives/archive/ArchiveProductGrid";
import ProductGridGraphQL from "@/components/global/primitives/archive/ProductGridGraphQL";
import {
  ArchiveFilterBarSkeleton,
  ArchiveSidebarSkeleton,
} from "@/components/global/primitives/archive/ArchiveLoading";
import {
  ARCHIVE_PRODUCT_GRID_CLASS_NAME,
  INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME,
  ProductCardsSkeleton,
} from "@/components/global/primitives/Loading/ProductCardLoading";
import { Brand } from "@/graphql/types/graphql";
import Link from "next/link";
import { GET_TAG_DETAILS_BY_SLUG } from "@/graphql/defs/products";
import { DealFilterType } from "@/lib/dealFilters";
import { isGraphqlArchive } from "@/lib/archiveSource";
import { siteConfig } from "@/site.config";
import {
  buildBrowseCategoryScopeMap,
  getCategoryScopeExtraIds,
  resolveBrowseCategoryTabs,
  type BrowseCategoryLike,
} from "@/lib/browseCategories";
import {
  ARCHIVE_PRODUCTS_PER_PAGE,
  type ArchiveFilterCategoryOption,
} from "@/lib/archiveFilters";
import { cn } from "@/lib/utils";

async function getData(parentId?: number, tagSlug?: string) {
  const [productsResult, browseCategoryRoots, navCategoriesFlat] =
    await Promise.all([
      getClient().query({ query: GET_ALL_PRODUCTS }),
      getClient()
        .query({ query: GET_BROWSE_CATEGORY_TABS, variables: { first: 50 } })
        .then((res) => res.data?.productCategories?.nodes ?? [])
        .catch(() => []),
      getClient()
        .query({ query: GET_NAV_CATEGORIES })
        .then((res) => res.data?.productCategories?.nodes ?? [])
        .catch(() => []),
    ]);

  const { data } = productsResult;

  let nestedCategories = [];
  let tagDetails = [];

  if (parentId) {
    const { data: categoryData, error: categoryError } = await getClient().query({
      query: GET_NESTED_CATEGORIES,
      variables: { parent: parentId },
    });

    if (!categoryError) {
      nestedCategories = categoryData.productCategories.nodes;
    } else {
      console.error("Error fetching nested categories:", categoryError);
    }
  }

  if (tagSlug) {
    const { data: tagData, error: tagError } = await getClient().query({
      query: GET_TAG_DETAILS_BY_SLUG,
      variables: { slug: [tagSlug] },
    });

    if (!tagError) {
      tagDetails = tagData.productTags.nodes;
    } else {
      console.error("Error fetching tag details:", tagError);
    }
  }

  const sidebarFilterCategories: ArchiveFilterCategoryOption[] =
    resolveBrowseCategoryTabs(
      browseCategoryRoots as BrowseCategoryLike[],
      navCategoriesFlat as BrowseCategoryLike[],
    )
      .filter(
        (
          item,
        ): item is BrowseCategoryLike & {
          databaseId: number;
          name: string;
        } => typeof item.databaseId === "number" && !!item.name,
      )
      .map((item) => ({
        databaseId: item.databaseId,
        name: item.name,
        slug: item.slug,
      }));

  const categoryScopeById = buildBrowseCategoryScopeMap(
    sidebarFilterCategories,
    browseCategoryRoots as BrowseCategoryLike[],
  );

  return {
    productCategories: data.productCategories.nodes,
    brands: data.brands.nodes,
    nestedCategories,
    tagDetails,
    sidebarFilterCategories,
    categoryScopeById,
  };
}

function buildCategoryScopeIds(
  category: { databaseId: number; slug?: string | null } | undefined,
  nestedCategories: { databaseId: number }[],
): number[] {
  if (!category) return [];
  const childIds = nestedCategories.map((item) => item.databaseId);
  const extras = getCategoryScopeExtraIds(category.slug);
  return Array.from(
    new Set([category.databaseId, ...childIds, ...extras]),
  );
}


interface ArchiveLayoutProps {
  title: string;
  description?: string;
  filters?: boolean;
  search?: boolean;
  brand?: Brand;
  category?: any;
  sort?: boolean;
  tag?: string;
  headingOverride?: string;
  descriptionOverride?: string;
  topLinks?: { href: string; label: string; active?: boolean }[];
  dealsType?: DealFilterType[];
  dealTags?: string[];
  inStockOnly?: boolean;
  defaultNewest?: boolean;
  /** Hide visible page title and description (e.g. shop page with promo banner). */
  hideHeading?: boolean;
}

const ArchiveLayout = async ({
  title,
  description,
  filters = false,
  search = false,
  brand,
  category,
  sort,
  tag,
  headingOverride,
  descriptionOverride,
  topLinks,
  dealsType,
  dealTags,
  inStockOnly,
  defaultNewest,
  hideHeading = false,
}: ArchiveLayoutProps) => {
  const graphqlArchive = isGraphqlArchive();
  const {
    productCategories,
    brands,
    nestedCategories,
    tagDetails,
    sidebarFilterCategories,
    categoryScopeById,
  } = await getData(category?.databaseId ?? "", tag);
  const categoryScopeIds = buildCategoryScopeIds(category, nestedCategories);
  const showSidebarCategoryFilter = filters && graphqlArchive && !category;

  // console.log('tagDetails', tagDetails);
  // console.log('categoryName', category.databaseId);
  // console.log('nestedCategories', nestedCategories);
  // console.log('descriptoin', description);

  return (
    <div
      className={cn(
        "container space-y-16 sm:space-y-20 lg:space-y-28",
        hideHeading ? "pt-4 pb-8 lg:pt-4 lg:pb-12" : "py-8 lg:py-12",
      )}
    >
      <div className="space-y-4 lg:space-y-6">
        {hideHeading ? (
          <h1 className="sr-only">
            {headingOverride || (tagDetails.length > 0 ? tagDetails[0].name : title)}
          </h1>
        ) : (
          <div className="max-w-screen-sm">
            <h1 className="block capitalize text-2xl sm:text-3xl lg:text-4xl font-semibold">
              {headingOverride || (tagDetails.length > 0 ? tagDetails[0].name : title)}
            </h1>
            <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              {descriptionOverride || (tagDetails.length > 0 && tagDetails[0].description
                ? tagDetails[0].description
                : description || `Explore ${siteConfig.brand.name} Collections – where style meets functionality. Elevate your experience with quality and diverse options. Shop now for a seamless blend of style and substance!`)}
            </span>
          </div>
        )}
        {topLinks && topLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-bold border ${
                  item.active
                    ? "border-header-green bg-header-green font-[family-name:var(--font-inter)] text-[#FACC15]"
                    : "border-header-green/30 bg-white text-header-green hover:bg-header-cream/40"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        {filters && !graphqlArchive ? (
          <Suspense fallback={<ArchiveFilterBarSkeleton />}>
            <TypesenseArchiveFilters />
          </Suspense>
        ) : null}

        {filters && graphqlArchive ? (
          <div className="lg:hidden">
            <Suspense fallback={<ArchiveFilterBarSkeleton />}>
              <ArchiveFilters
                filterCategories={sidebarFilterCategories}
                showCategoryFilter={showSidebarCategoryFilter}
              />
            </Suspense>
          </div>
        ) : null}

        <hr
          className={`border-slate-200 dark:border-slate-700 ${filters && graphqlArchive ? "lg:hidden" : ""}`}
        />

        <main>
          <div
            className={
              filters && graphqlArchive
                ? "grid grid-cols-12 gap-4"
                : "flex flex-col lg:flex-row"
            }
          >
            {filters && graphqlArchive ? (
              <aside className="hidden lg:col-span-3 lg:block">
                <Suspense fallback={<ArchiveSidebarSkeleton />}>
                  <ArchiveFilters
                    variant="sidebar"
                    filterCategories={sidebarFilterCategories}
                    showCategoryFilter={showSidebarCategoryFilter}
                  />
                </Suspense>
              </aside>
            ) : null}

            <div
              className={
                filters && graphqlArchive ? "col-span-12 lg:col-span-9" : "flex-1"
              }
            >
              {graphqlArchive ? (
                filters ? (
                  <Suspense
                    fallback={
                      <ProductCardsSkeleton
                        className={ARCHIVE_PRODUCT_GRID_CLASS_NAME}
                      />
                    }
                  >
                    <ArchiveProductGrid
                      categoryIds={
                        categoryScopeIds.length > 0 ? categoryScopeIds : undefined
                      }
                      categoryScopeById={categoryScopeById}
                      first={ARCHIVE_PRODUCTS_PER_PAGE}
                    />
                  </Suspense>
                ) : (
                  <Suspense
                    fallback={
                      <ProductCardsSkeleton
                        className={ARCHIVE_PRODUCT_GRID_CLASS_NAME}
                      />
                    }
                  >
                    <ProductGridGraphQL
                      categoryIds={categoryScopeIds}
                      first={ARCHIVE_PRODUCTS_PER_PAGE}
                    />
                  </Suspense>
                )
              ) : (
                <Suspense
                  fallback={
                    <ProductCardsSkeleton
                      count={12}
                      className={INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME}
                    />
                  }
                >
                  <InstantSearchWrapper
                    categories={productCategories}
                    brands={brands}
                    brand={brand}
                    category={category}
                    categoryScopeIds={categoryScopeIds}
                    subCategories={nestedCategories}
                    filters={filters}
                    search={search}
                    sort={sort}
                    tag={tag}
                    routing={true}
                    dealsType={dealsType}
                    dealTags={dealTags}
                    inStockOnly={inStockOnly}
                    defaultNewest={defaultNewest}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchiveLayout;
