import { Suspense } from "react";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_NESTED_CATEGORIES } from "@/graphql/defs/nav";
import InstantSearchWrapper from "@/components/global/primitives/InstantSearchWrapper";
import ArchiveFilters from "@/components/global/primitives/archive/ArchiveFilters";
import TypesenseArchiveFilters from "@/components/global/primitives/archive/TypesenseArchiveFilters";
import ArchiveProductGrid, {
  type ArchiveProductGridProps,
} from "@/components/global/primitives/archive/ArchiveProductGrid";
import ProductGridGraphQL from "@/components/global/primitives/archive/ProductGridGraphQL";
import { ArchiveFilterBarSkeleton } from "@/components/global/primitives/archive/ArchiveLoading";
import {
  ARCHIVE_PRODUCT_GRID_CLASS_NAME,
  INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME,
  ProductCardsSkeleton,
} from "@/components/global/primitives/Loading/ProductCardLoading";
import { Brand } from "@/graphql/types/graphql";
import Link from "next/link";
import { GET_TAG_DETAILS_BY_SLUG } from "@/graphql/defs/products";
import { ArchiveFilterState } from "@/lib/archiveFilters";
import { DealFilterType } from "@/lib/dealFilters";
import { isGraphqlArchive } from "@/lib/archiveSource";
import { siteConfig } from "@/site.config";
import { getCategoryScopeExtraIds } from "@/lib/browseCategories";

async function getData(parentId?: number, tagSlug?: string) {
  const { data } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

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

  return {
    productCategories: data.productCategories.nodes,
    brands: data.brands.nodes,
    nestedCategories,
    tagDetails,
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
  /** GraphQL archive default filters when the URL omits them (e.g. /deals → in-stock). */
  filterDefaults?: Partial<ArchiveFilterState>;
  /** Always applied — URL cannot override (e.g. /deals locks on-sale). */
  lockedFilters?: Partial<ArchiveFilterState>;
  /** Deal archive — on-sale query + hide products without a real discount. */
  dealsOnly?: boolean;
  productCardProps?: ArchiveProductGridProps["productCardProps"];
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
  filterDefaults,
  lockedFilters,
  dealsOnly,
  productCardProps,
}: ArchiveLayoutProps) => {
  const graphqlArchive = isGraphqlArchive();
  const { productCategories, brands, nestedCategories, tagDetails } = await getData(category?.databaseId ?? '', tag);
  const categoryScopeIds = buildCategoryScopeIds(category, nestedCategories);

  // console.log('tagDetails', tagDetails);
  // console.log('categoryName', category.databaseId);
  // console.log('nestedCategories', nestedCategories);
  // console.log('descriptoin', description);

  return (
    <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
      <div className="space-y-4 lg:space-y-6">
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
        {topLinks && topLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-4 py-2 text-sm border ${
                  item.active
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-primary-500 border-primary-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        {filters ? (
          <Suspense fallback={<ArchiveFilterBarSkeleton />}>
            {graphqlArchive ? (
              <ArchiveFilters
                filterDefaults={filterDefaults}
                lockedFilters={lockedFilters}
                dealsOnly={dealsOnly}
              />
            ) : (
              <TypesenseArchiveFilters />
            )}
          </Suspense>
        ) : null}

        <hr className="border-slate-200 dark:border-slate-700 " />

        <main>
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 ">
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
                      first={45}
                      filterDefaults={filterDefaults}
                      lockedFilters={lockedFilters}
                      dealsOnly={dealsOnly}
                      productCardProps={productCardProps}
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
                      first={45}
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
