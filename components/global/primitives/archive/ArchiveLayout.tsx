import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_NESTED_CATEGORIES } from "@/graphql/defs/nav";
import InstantSearchWrapper from "@/components/global/primitives/InstantSearchWrapper";
import ProductGridGraphQL from "@/components/global/primitives/archive/ProductGridGraphQL";
import { Brand } from "@/graphql/types/graphql";
import Link from "next/link";
import { GET_TAG_DETAILS_BY_SLUG } from "@/graphql/defs/products";
import { DealFilterType } from "@/lib/dealFilters";
import { useGraphqlArchive } from "@/lib/archiveSource";
import { siteConfig } from "@/site.config";

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
  category: { databaseId: number } | undefined,
  nestedCategories: { databaseId: number }[],
): number[] {
  if (!category) return [];
  const childIds = nestedCategories.map((item) => item.databaseId);
  return [category.databaseId, ...childIds];
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
}: ArchiveLayoutProps) => {
  const graphqlArchive = useGraphqlArchive();
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

        <hr className="border-slate-200 dark:border-slate-700 " />

        <main>
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 ">
              {/* {JSON.stringify(search, null, 2)}
              {JSON.stringify(productCategories, null, 2)}
              {JSON.stringify(brand, null, 2)} */}
              {graphqlArchive ? (
                <ProductGridGraphQL
                  categoryIds={categoryScopeIds}
                  first={45}
                />
              ) : (
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
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchiveLayout;
