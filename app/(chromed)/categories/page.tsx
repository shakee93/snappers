import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { Category } from "@/graphql/types/graphql";
import { orderCollectionNavForDropdown } from "@/lib/collectionNavOrder";
import { getCategoryPath } from "@/lib/productUrl";
import Link from "next/link";
import { Metadata } from "next";
import { siteConfig } from "@/site.config";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "All Categories",
  description: `Browse every category at ${siteConfig.brand.name} — cat, dog, bird, and aquarium food, health products, and accessories.`,
};

async function getData() {
  const { data } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  return {
    productCategories: data.productCategories.nodes,
  };
}

const Page = async () => {
  const { productCategories } = await getData();

  const sortedCategories = orderCollectionNavForDropdown(
    productCategories as Category[],
  );

  return (
    <div>
      <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-4 lg:space-y-14">
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Browse Categories
            </h2>

            <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              Explore {siteConfig.brand.name} categories – where style meets
              functionality. Elevate your experience with quality and diverse
              options. Shop now for a seamless blend of style and substance!
            </span>
            <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
              <Link href={"/"} className="">
                Homepage
              </Link>
              <span className="text-xs mx-1 sm:mx-1.5">/</span>
              <span className="underline">Categories</span>
            </div>
          </div>
          <hr className="border-slate-200 dark:border-slate-700 " />
          <main>
            <div className="flex flex-col lg:flex-row">
              <ul className="py-2 grid gird-cols-1 md:grid-cols-3 text-left text-sm text-gray-700 dark:text-gray-200">
                {sortedCategories
                  ?.filter(
                    (category: Category) => category.count && category.count > 0,
                  )
                  .map((category: Category, index: number) => (
                    <li key={index}>
                      <Link
                        href={getCategoryPath(category.slug ?? "")}
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        {category.name} ({category.count})
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
