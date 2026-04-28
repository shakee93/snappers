import { Suspense } from "react";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_OPTIONS } from "@/graphql/defs/options";
import HeaderClientWrapper from "./HeaderClientWrapper";

const getData = async () => {
  const { data: productsData } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  const { data: optionsData } = await getClient().query({
    query: GET_OPTIONS,
  });

  return {
    productCategories: productsData?.productCategories?.nodes || [],
    brands: productsData?.brands?.nodes || [],
    options: optionsData || {},
  };
};

const HeaderSkeleton = () => (
  <div className="bg-white border-b border-gray-100" aria-hidden>
    <div className="h-8 bg-primaryColor/5" />
    <div className="h-16 md:h-20" />
    <div className="h-10 hidden md:block bg-gray-50" />
  </div>
);

const HeaderInner = async () => {
  const { productCategories, brands, options } = await getData();

  return (
    <HeaderClientWrapper
      productCategories={productCategories}
      brands={brands}
      options={options}
    />
  );
};

const Header = () => (
  <Suspense fallback={<HeaderSkeleton />}>
    <HeaderInner />
  </Suspense>
);

export default Header;
