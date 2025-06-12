import { getClient } from '@/graphql/apollo-ssr'
import { GET_SITEMAP_BRANDS } from '@/graphql/defs/sitemap-queries'
import { Brand } from '@/graphql/types/graphql'
import type { MetadataRoute } from 'next'

export const BASE_URL = 'https://gqmobiles.lk'

export const getBrands = async (): Promise<Brand[]> => {
  const client = await getClient()
  const { data } = await client.query({
    query: GET_SITEMAP_BRANDS
  })
  return data.brands.nodes
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = await getBrands()

  const sitemapEntries: MetadataRoute.Sitemap = [
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

  return sitemapEntries
}
