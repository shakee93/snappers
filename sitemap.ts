import type { MetadataRoute } from 'next'

const site = "https://api.gqmobiles.lk/"; 
const YOAST_API_ENDPOINT = `${site}wp-json/yoast/v1/sitemap_index`;  


async function fetchSitemapData() {
  // Fetch the Yoast sitemap data from the WordPress site
  const response = await fetch(YOAST_API_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch sitemap data from Yoast API');
  }
  return response.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch Yoast data
  const yoastData = await fetchSitemapData();
  
  // Construct URLs for the sitemap based on Yoast response
  // This depends on the structure of the response from Yoast API.
  const sitemapEntries = yoastData.map((item: any) => ({
    url: item.loc, // Adjust this property based on the Yoast API response structure
    lastModified: new Date(item.lastmod), // Ensure this field exists or replace with Date()
    changeFrequency: item.changefreq || 'monthly',
    priority: item.priority || 0.5,
  }));

  // Return the generated sitemap array
  return [
    {
      url: 'https://gqmobiles.lk',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...sitemapEntries,
  ];
}
