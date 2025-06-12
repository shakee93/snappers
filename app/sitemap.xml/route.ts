import { getClient } from '@/graphql/apollo-ssr'
import { GET_SITEMAP_BRANDS } from '@/graphql/defs/sitemap-queries'
import { Brand } from '@/graphql/types/graphql'

export const BASE_URL = 'https://gqmobiles.lk'

export const getBrands = async (): Promise<Brand[]> => {
  const client = await getClient()
  const { data } = await client.query({
    query: GET_SITEMAP_BRANDS
  })
  return data.brands.nodes
}

export async function GET() {
  const brands = await getBrands()

  const sitemapEntries = [
    // Main sitemap index entries
    {
      url: `${BASE_URL}/sitemaps/brands/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sitemaps/collections/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sitemaps/pages/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Add dynamic brand sitemaps
  brands.forEach(brand => {
    sitemapEntries.push({
      url: `${BASE_URL}/s/sitemap/${brand.slug}.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  })

  // Generate XML sitemap index
  const sitemapXml = sitemapEntries.map(entry => 
    `  <sitemap>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </sitemap>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapXml}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
