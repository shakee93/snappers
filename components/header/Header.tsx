import { Suspense } from "react";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_OPTIONS } from "@/graphql/defs/options";
import { GET_NAV_CATEGORIES } from "@/graphql/defs/nav";
import type { ProductCategory } from "@/graphql/types/graphql";
import HeaderClientWrapper from "./HeaderClientWrapper";

const NAV_CATEGORIES_QUERY = `
  query GetNavCategoriesHeader {
    productCategories(first: 1000) {
      nodes {
        id
        name
        slug
        databaseId
        parentDatabaseId
        image {
          id
          sourceUrl
          altText
          databaseId
        }
      }
    }
  }
`;

/** Bypass stuck Next fetch cache when Apollo returns no nav categories. */
async function fetchNavCategoriesFresh(): Promise<ProductCategory[]> {
  const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL;
  if (!endpoint) return [];

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: NAV_CATEGORIES_QUERY }),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      data?: { productCategories?: { nodes?: unknown[] } };
    };
    return (json.data?.productCategories?.nodes ?? []) as ProductCategory[];
  } catch {
    return [];
  }
}

const getData = async () => {
  const [productsResult, optionsResult, navCategoriesResult, navCategoriesFresh] =
    await Promise.all([
      getClient().query({ query: GET_ALL_PRODUCTS }),
      getClient().query({ query: GET_OPTIONS }),
      getClient().query({ query: GET_NAV_CATEGORIES }),
      fetchNavCategoriesFresh(),
    ]);

  const navFromApollo =
    navCategoriesResult.data?.productCategories?.nodes || [];
  const navCategories =
    navCategoriesFresh.length >= navFromApollo.length
      ? navCategoriesFresh
      : navFromApollo.length > 0
        ? navFromApollo
        : navCategoriesFresh;

  return {
    productCategories: productsResult.data?.productCategories?.nodes || [],
    brands: productsResult.data?.brands?.nodes || [],
    options: optionsResult.data || {},
    navCategories,
  };
};

const HeaderSkeleton = () => (
  <div className="bg-white border-b border-gray-100" aria-hidden>
    <div className="h-8 bg-primary-500/5" />
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
