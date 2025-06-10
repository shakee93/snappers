import {
  fetchPageSitemap,
  fetchPwbBrandSitemap,
  fetchProductCatSitemap,
} from "@/data/sitemap-helpers";
import { getClient } from "@/graphql/apollo-ssr";
import { ProductURLData } from "@/graphql/defs/sitemap-queries";
import { gql } from "@apollo/client";

const FRONT_APP_URL = "https://gqmobiles.lk";

// Define interfaces for sitemap entries
interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
  source?: string;
}

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
const fetchProductSitemapWithGraphql = (products: any[]): SitemapEntry[] => {
  return products.map((product: any) => {
    const lastModified = product.date ? new Date(product.date) : new Date();
    const brand = product.brands?.nodes?.[0]?.name.toLowerCase().replace(/\s+/g, "-") || "";
    const slug = product.slug || "";
    const url = `${FRONT_APP_URL}/${brand}/${slug}`;

    return {
      url,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      source: "products",
    };
  });
};

// Function to deduplicate sitemap entries with enhanced debugging
const dedupeSitemapEntries = (entries: SitemapEntry[]): SitemapEntry[] => {
  const urlMap = new Map<string, SitemapEntry>();
  const duplicatesLog: Record<string, string[]> = {};
  
  // Track sources for each entry to identify where duplicates are coming from
  entries.forEach(entry => {
    if (!urlMap.has(entry.url)) {
      urlMap.set(entry.url, {...entry});
    } else {
      // Record duplicate information for debugging
      if (!duplicatesLog[entry.url]) {
        duplicatesLog[entry.url] = [urlMap.get(entry.url)?.source || "unknown"];
      }
      duplicatesLog[entry.url].push(entry.source || "unknown");
      
      // Keep the entry with the highest priority
      if (entry.priority > (urlMap.get(entry.url)?.priority || 0)) {
        urlMap.set(entry.url, {...entry});
      }
    }
  });
  
  // Log details about duplicates
  const duplicateUrls = Object.keys(duplicatesLog);
  if (duplicateUrls.length > 0) {
    console.log(`\n----- Duplicate URL Details -----`);
    console.log(`Found ${duplicateUrls.length} duplicate URLs:`);
    
    // Log some examples of duplicates and their sources
    const samplesToShow = Math.min(5, duplicateUrls.length);
    for (let i = 0; i < samplesToShow; i++) {
      const url = duplicateUrls[i];
      console.log(`- ${url} appears in: ${duplicatesLog[url].join(', ')}`);
    }
    
    // Log details about URLs appearing 3 or more times
    const triplicates = duplicateUrls.filter(url => duplicatesLog[url].length >= 2);
    if (triplicates.length > 0) {
      console.log(`\n${triplicates.length} URLs appear 3 or more times:`);
      triplicates.forEach(url => {
        console.log(`- ${url} (${duplicatesLog[url].length + 1} occurrences)`);
      });
    }
  }
  
  return Array.from(urlMap.values());
};

// Function to filter out testing URLs
const filterTestingUrls = (entries: SitemapEntry[]): SitemapEntry[] => {
  const filteredEntries = entries.filter(entry => {
    const lowerUrl = entry.url.toLowerCase();
    return !lowerUrl.includes('test') && !lowerUrl.includes('testing');
  });
  
  const removedCount = entries.length - filteredEntries.length;
  if (removedCount > 0) {
    console.log(`\n----- Test URL Filtering -----`);
    console.log(`Removed ${removedCount} URLs containing "test" or "testing"`);
  }
  
  return filteredEntries;
};

export default async function sitemap() {
  // Fetch data
  const listAllProducts = await getAllProducts();
  const productData = fetchProductSitemapWithGraphql(listAllProducts.products);
  console.log(`Generated ${productData.length} sitemap entries for products`);

  const pageData = await fetchPageSitemap() as SitemapEntry[];
  pageData.forEach(entry => entry.source = "pages");
  console.log(`Generated ${pageData.length} sitemap entries for pages`);

  const pwbBrandData = await fetchPwbBrandSitemap() as SitemapEntry[];
  pwbBrandData.forEach(entry => entry.source = "brands");
  console.log(`Generated ${pwbBrandData.length} sitemap entries for brands`);

  const productCatData = await fetchProductCatSitemap() as SitemapEntry[];
  productCatData.forEach(entry => entry.source = "categories");
  console.log(
    `Generated ${productCatData.length} sitemap entries for product categories`
  );

  // Combine all results into a single array
  const combinedEntries = [
    ...pageData,
    ...productData,
    ...pwbBrandData,
    ...productCatData,
  ];
  
  // Deduplicate entries
  const sitemapEntries = dedupeSitemapEntries(combinedEntries);
  
  // Filter out test/testing URLs
  const filteredEntries = filterTestingUrls(sitemapEntries);

  // // Add main site entry and return sitemap
  // console.log(
  //   `\n----- Sitemap Summary -----`
  // );
  // console.log(
  //   `Total entries before deduplication: ${combinedEntries.length}`
  // );
  // console.log(
  //   `Total entries after deduplication: ${sitemapEntries.length}`
  // );
  // console.log(
  //   `Removed ${combinedEntries.length - sitemapEntries.length} duplicate entries`
  // );
  // console.log(
  //   `Final sitemap entries: ${filteredEntries.length}`
  // );

  // Remove source property before returning (not part of sitemap spec)
  return filteredEntries.map(({ source, ...entry }) => entry);
}
