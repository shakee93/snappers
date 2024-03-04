import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";
import { Brand, ProductCategory } from "@/graphql/types/graphql";

async function getData(categories: number[] | null = null) {
  const { data, error } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  return {
    productCategories: data.productCategories.nodes,
    brands: data.brands.nodes,
  };
}

interface ArchiveLayoutProps {
  title: string;
  description?: string;
  filters?: boolean;
  search?: boolean;
  brand?: Brand;
  category?: ProductCategory;
}

const ArchiveLayout = async ({
  title,
  description,
  filters = false,
  search = false,
  brand,
  category,
}: ArchiveLayoutProps) => {
  const { productCategories, brands } = await getData();
  return (
    <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
      <div className="space-y-4 lg:space-y-14">
        <div className="max-w-screen-sm">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
            {title}
          </h2>
          <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
            {description ||
              " We not only help you design exceptional products, but also make it\n" +
                "easy for you to share your designs with more like-minded people."}
          </span>
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
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchiveLayout;
