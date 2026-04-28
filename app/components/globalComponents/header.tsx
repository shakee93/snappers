import { Suspense } from "react";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_OPTIONS } from "@/graphql/defs/options";
import { GET_NAV_CATEGORIES } from "@/graphql/defs/nav";
import HeaderClientWrapper from "./HeaderClientWrapper";

const getData = async () => {
  const [productsResult, optionsResult, navCategoriesResult] = await Promise.all([
    getClient().query({ query: GET_ALL_PRODUCTS }),
    getClient().query({ query: GET_OPTIONS }),
    getClient().query({ query: GET_NAV_CATEGORIES }),
  ]);

  return {
    productCategories: productsResult.data?.productCategories?.nodes || [],
    brands: productsResult.data?.brands?.nodes || [],
    options: optionsResult.data || {},
    navCategories: navCategoriesResult.data?.productCategories?.nodes || [],
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
  const { productCategories, brands, options, navCategories } = await getData();

  return (
    <HeaderClientWrapper
      productCategories={productCategories}
      brands={brands}
      options={options}
      navCategories={navCategories}
    />
  );
};

const Header = () => (
  <Suspense fallback={<HeaderSkeleton />}>
    <HeaderInner />
  </Suspense>
);

export default Header;
