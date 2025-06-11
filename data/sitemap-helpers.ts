import { parseStringPromise } from "xml2js";

const API_SITE_URL = "https://api.gqmobiles.lk";
const FRONT_APP_URL = "https://gqmobiles.lk";

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}

const buildSitemapEntry = (
  urlEntry: any,
  url: string,
  changeFrequency = "monthly",
  priority = 0.5
): SitemapEntry => ({
  url,
  lastModified: urlEntry.lastmod?.[0] ? new Date(urlEntry.lastmod[0]) : new Date(),
  changeFrequency: urlEntry.changefreq?.[0] || changeFrequency,
  priority: parseFloat(urlEntry.priority?.[0]) || priority,
});

async function fetchAndParseSitemap(
  url: string,
  transformFn?: (urlEntry: any) => SitemapEntry
): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch sitemap from ${url}`);

    const xml = await res.text();
    const json = await parseStringPromise(xml);
    return json.urlset.url.map((entry: any) => transformFn?.(entry) || buildSitemapEntry(
      entry,
      entry.loc[0].replace(API_SITE_URL, FRONT_APP_URL)
    ));
  } catch (err) {
    console.error("Error fetching or parsing sitemap:", err);
    return [];
  }
}

const fetchPageSitemap = () =>
  fetchAndParseSitemap(`${API_SITE_URL}/page-sitemap.xml`, (entry) =>
    buildSitemapEntry(entry, entry.loc[0].replace(API_SITE_URL, FRONT_APP_URL))
  );

const fetchPwbBrandSitemap = () =>
  fetchAndParseSitemap(`${API_SITE_URL}/pwb-brand-sitemap.xml`, (entry) => {
    const originalLoc = entry.loc[0];
    const brandMatch = originalLoc.match(/\/brand\/([^/]+)/);
    const transformedUrl = brandMatch
      ? `${FRONT_APP_URL}/${brandMatch[1]}`
      : originalLoc.replace(API_SITE_URL, FRONT_APP_URL);

    return buildSitemapEntry(entry, transformedUrl);
  });

const fetchProductCatSitemap = () =>
  fetchAndParseSitemap(`${API_SITE_URL}/product_cat-sitemap.xml`, (entry) => {
    const lastCategory = entry.loc[0].split("/").filter(Boolean).pop();
    const url = lastCategory
      ? `${FRONT_APP_URL}/collections/${lastCategory}`
      : entry.loc[0];

    return buildSitemapEntry(entry, url, "daily", 0.8);
  });

export { fetchPageSitemap, fetchPwbBrandSitemap, fetchProductCatSitemap };
