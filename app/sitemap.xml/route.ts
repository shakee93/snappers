import { BASE_URL, getBrands } from '../sitemap-helpers'



export async function GET() {
  const brands = await getBrands()

  const sitemapEntries = [
    { url: `${BASE_URL}/s/brands/sitemap.xml`, lastModified: new Date() },
    { url: `${BASE_URL}/s/collections/sitemap.xml`, lastModified: new Date() },
    { url: `${BASE_URL}/s/pages/sitemap.xml`, lastModified: new Date() },
  ]

  brands.forEach(brand => {
    sitemapEntries.push({
      url: `${BASE_URL}/s/sitemap/${brand.slug}.xml`,
      lastModified: new Date(),
    })
  })

  const sitemapXml = sitemapEntries.map(entry =>
    `  <sitemap>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
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
