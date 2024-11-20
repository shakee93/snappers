import { parseStringPromise } from "xml2js";

const API_SITE_URL = "https://api.gqmobiles.lk";
const FRONT_APP_URL = "https://gqmobiles.lk";

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}

// Generic function to fetch and parse any XML sitemap with optional transformation
async function fetchAndParseSitemap(
  url: string,
  transformFn?: (urlEntry: any) => SitemapEntry
): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap from ${url}`);
    }

    const xmlText = await response.text();
    const jsonData = await parseStringPromise(xmlText);

    return jsonData.urlset.url.map((urlEntry: any) => {
      if (transformFn) {
        return transformFn(urlEntry);
      } else {
        return {
          url: urlEntry.loc[0].replace(API_SITE_URL, FRONT_APP_URL),
          lastModified: urlEntry.lastmod
            ? new Date(urlEntry.lastmod[0])
            : new Date(),
          changeFrequency: urlEntry.changefreq
            ? urlEntry.changefreq[0]
            : "monthly",
          priority: urlEntry.priority
            ? parseFloat(urlEntry.priority[0])
            : 0.5,
        };
      }
    });
  } catch (error) {
    console.error("Error fetching or parsing sitemap:", error);
    throw error;
  }
}

// Fetchers for individual XML sitemaps
const fetchPageSitemap = () =>
  fetchAndParseSitemap(`${API_SITE_URL}/page-sitemap.xml`);

const fetchPwbBrandSitemap = () =>
  fetchAndParseSitemap(
    `${API_SITE_URL}/pwb-brand-sitemap.xml`,
    (urlEntry) => {
      const originalLoc = urlEntry.loc[0];
      let transformedUrl = originalLoc;

      const brandMatch = originalLoc.match(/\/brand\/([^/]+)/);
      if (brandMatch) {
        const brandName = brandMatch[1];
        transformedUrl = `${FRONT_APP_URL}/${brandName}`;
      } else {
        transformedUrl = originalLoc.replace(API_SITE_URL, FRONT_APP_URL);
      }

      return {
        url: transformedUrl,
        lastModified: urlEntry.lastmod
          ? new Date(urlEntry.lastmod[0])
          : new Date(),
        changeFrequency: urlEntry.changefreq
          ? urlEntry.changefreq[0]
          : "monthly",
        priority: urlEntry.priority
          ? parseFloat(urlEntry.priority[0])
          : 0.5,
      };
    }
  );

const fetchProductCatSitemap = () =>
  fetchAndParseSitemap(
    `${API_SITE_URL}/product_cat-sitemap.xml`,
    (urlEntry) => {
      const originalLoc = urlEntry.loc[0];
      const lastCategory = originalLoc.split("/").filter(Boolean).pop();
      const transformedUrl = lastCategory
        ? `${FRONT_APP_URL}/collections/${lastCategory}`
        : originalLoc;

      return {
        url: transformedUrl,
        lastModified: urlEntry.lastmod
          ? new Date(urlEntry.lastmod[0])
          : new Date(),
        changeFrequency: urlEntry.changefreq
          ? urlEntry.changefreq[0]
          : "monthly",
        priority: urlEntry.priority
          ? parseFloat(urlEntry.priority[0])
          : 0.5,
      };
    }
  );

export { fetchPageSitemap, fetchPwbBrandSitemap, fetchProductCatSitemap };
