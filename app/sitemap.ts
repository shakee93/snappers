import type { MetadataRoute } from 'next'
import { parseStringPromise } from 'xml2js';

const site = "https://api.gqmobiles.lk/"; 
// const YOAST_API_ENDPOINT = `${site}wp-json/yoast/v1/sitemap_index`;  
const YOAST_API_ENDPOINT = `${site}sitemap_index.xml`;



async function fetchSitemapData() {
  const response = await fetch('https://api.gqmobiles.lk/sitemap_index.xml');
  if (!response.ok) {
    throw new Error('Failed to fetch sitemap data');
  }

  const xmlText = await response.text(); // Get XML as text
  const jsonData = await parseStringPromise(xmlText); // Convert XML to JSON

  // Adjust the following line to match the structure of your parsed JSON data
  return jsonData.sitemapindex.sitemap; // Assuming Yoast XML structure
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
