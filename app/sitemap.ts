import {
  fetchPageSitemap,
  fetchPwbBrandSitemap,
  fetchProductCatSitemap,
} from "@/data/sitemap-helpers";
import { getClient } from "@/graphql/apollo-ssr";
import { ProductURLData } from "@/graphql/defs/sitemap-queries";
import { gql } from "@apollo/client";

const FRONT_APP_URL = "https://gqmobiles.lk";

// Function to fetch all products via GraphQL
const getAllProducts = async () => {
  let allProducts: any[] = [];
  let hasNextPage = true;
  let afterCursor = null;

  try {
    while (hasNextPage) {
      const { data }: any = await getClient().query({
        query: gql`
          query GetProducts($first: Int!, $after: String) {
            products(first: $first, after: $after) {
              nodes {
                ...ProductURLData
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
          ${ProductURLData}
        `,
        variables: {
          first: 100, // Adjust batch size based on API limit
          after: afterCursor,
        },
      });

      const { nodes, pageInfo } = data.products;
      allProducts = [...allProducts, ...nodes];
      hasNextPage = pageInfo.hasNextPage;
      afterCursor = pageInfo.endCursor;
    }

    return { products: allProducts };
  } catch (error) {
    console.error("Error fetching all sitemap products", error);
    return { products: [] };
  }
};

// Transform products into sitemap entries
const fetchProductSitemapWithGraphql = (products: any[]) => {
  return products.map((product: any) => {
    const lastModified = product.date ? new Date(product.date) : new Date();
    const brand = product.brands?.nodes?.[0]?.name.toLowerCase() || "";
    const slug = product.slug || "";
    const url = `${FRONT_APP_URL}/${brand}/${slug}`;

    return {
      url,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    };
  });
};

export default async function sitemap() {
  // Fetch data
  const listAllProducts = await getAllProducts();
  const productData = fetchProductSitemapWithGraphql(listAllProducts.products);
  console.log(`Generated ${productData.length} sitemap entries for products`);

  const pageData = await fetchPageSitemap();
  console.log(`Generated ${pageData.length} sitemap entries for pages`);

  const pwbBrandData = await fetchPwbBrandSitemap();
  console.log(`Generated ${pwbBrandData.length} sitemap entries for brands`);

  const productCatData: any = await fetchProductCatSitemap();
  console.log(
    `Generated ${productCatData.length} sitemap entries for product categories`
  );

  // Combine all results into a single array
  const sitemapEntries = [
    ...pageData,
    ...productData,
    ...pwbBrandData,
    ...productCatData,
  ];

  // Add main site entry and return sitemap
  console.log(
    `Total sitemap entries generated: ${sitemapEntries.length + 1}` // +1 for the main site entry
  );

  return [
    {
      url: FRONT_APP_URL,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...sitemapEntries,
  ];
}
