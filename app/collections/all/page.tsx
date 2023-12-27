import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_ALL_PRODUCTS,
} from "@/graphql/defs/products";
import TabFilters from "@/app/components/TabFilters";
import Pagination from "@/shared/Pagination/Pagination";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";

export async function getData(categories: number[] | null = null) {
  const { data, error } = await getClient().query({
    query: GET_ALL_PRODUCTS,
    fetchPolicy: 'no-cache'
  });

  return {
    productCategories: data.productCategories.nodes,
    brands: data.brands.nodes,
  };
}


const Page = async () => {
  const { productCategories, brands } = await getData();

  return (
    <div className={`nc-PageCollection2 `} data-nc-id="PageCollection2">
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {/* HEADING */}
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              All Collections
            </h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              We not only help you design exceptional products, but also make it
              easy for you to share your designs with more like-minded people.
            </span>
          </div>
          <TabFilters brands={brands} categories={productCategories} />

          <hr className="border-slate-200 dark:border-slate-700" />
          <main>
            {/* LOOP ITEMS */}
            <div className="flex flex-col lg:flex-row">
              <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
              <div className="flex-1 ">
                {/*<ProductGrid products={products} />*/}
                <InstantSearchWrapper/>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
