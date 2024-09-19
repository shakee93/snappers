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
  category?: any;
  sort?: boolean;
  tag?: string;
}

const ArchiveLayout = async ({
  title,
  description,
  filters = false,
  search = false,
  brand,
  category,
  sort,
  tag
}: ArchiveLayoutProps) => {
  const { productCategories, brands } = await getData();
  // console.log('category', category);
  return (
    <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
      <div className="space-y-4 lg:space-y-6">
        <div className="max-w-screen-sm">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
            {title}
          </h2>
          <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
            {description ||
              "Explore GQ Mobiles Collections – where style meets functionality. Elevate your experience with quality and diverse options. Shop now for a seamless blend of style and substance!"}
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
                sort={sort}
                tag={tag}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchiveLayout;
