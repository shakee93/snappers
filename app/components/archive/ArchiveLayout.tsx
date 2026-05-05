import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_NESTED_CATEGORIES } from "@/graphql/defs/nav";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";
import { Brand } from "@/graphql/types/graphql";
import Link from "next/link";
import { GET_TAG_DETAILS_BY_SLUG } from "@/graphql/defs/products";

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
  dealsType?: ("clearance" | "offers" | "free-shipping")[];
  dealTags?: string[];
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
}: ArchiveLayoutProps) => {

  const { productCategories, brands, nestedCategories, tagDetails } = await getData(category?.databaseId ?? '', tag);

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
              : description || "Explore GQ Mobiles Collections – where style meets functionality. Elevate your experience with quality and diverse options. Shop now for a seamless blend of style and substance!")}
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
                    ? "bg-primaryColor text-white border-primaryColor"
                    : "bg-white text-primaryColor border-primaryColor"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 text-sm">
          {nestedCategories.map((item: any, index: number) => (
            <Link
              href={item.slug}
              key={index}
              className="flex-shrink-0 rounded-md py-2 px-4 bg-white border border-primaryColor"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <hr className="border-slate-200 dark:border-slate-700 " />

        <main>
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 ">
              {/* {JSON.stringify(search, null, 2)}
              {JSON.stringify(productCategories, null, 2)}
              {JSON.stringify(brand, null, 2)} */}
              <InstantSearchWrapper
                categories={productCategories}
                brands={brands}
                brand={brand}
                category={category}
                filters={filters}
                search={search}
                sort={sort}
                tag={tag}
                routing={true}
                dealsType={dealsType}
                dealTags={dealTags}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchiveLayout;
