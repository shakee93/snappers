import { getClient } from '@/graphql/apollo-ssr'
import { GET_SITEMAP_BRANDS } from '@/graphql/defs/sitemap-queries'
import { Brand } from '@/graphql/types/graphql'
import type { MetadataRoute } from 'next'

export const BASE_URL = 'https://gqmobiles.lk'

export const getBrands = async (): Promise<Brand[]> => {
  const client = await getClient()

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data } = await client.query({
        query: GET_SITEMAP_BRANDS
      })
      return data?.brands?.nodes ?? []
    } catch (error: any) {
      const statusCode = error?.networkError?.statusCode
      const shouldRetry = statusCode === 429 || (statusCode >= 500 && statusCode < 600)

      if (!shouldRetry || attempt === 2) {
        console.error('Failed to fetch sitemap brands', error)
        return []
      }

      const retryDelayMs = 300 * (attempt + 1)
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    }
  }

  return []
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
