import { getClient } from '@/graphql/apollo-ssr'
import { GET_SITEMAP_BRANDS } from '@/graphql/defs/sitemap-queries'
import { Brand } from '@/graphql/types/graphql'
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/site.config'

export const BASE_URL = siteConfig.url.base

function getGraphqlErrorCode(error: unknown): string | undefined {
  const graphQLErrors = (error as { graphQLErrors?: Array<{ extensions?: { code?: unknown } }> })?.graphQLErrors
  const firstCode = graphQLErrors?.[0]?.extensions?.code
  return typeof firstCode === 'string' ? firstCode : undefined
}

function shouldRetrySitemapFetch(error: unknown): boolean {
  const statusCode = (error as { networkError?: { statusCode?: unknown } })?.networkError?.statusCode
  const numericStatusCode = typeof statusCode === 'number' ? statusCode : undefined

  if (numericStatusCode === 429) return true
  if (typeof numericStatusCode === 'number' && numericStatusCode >= 500 && numericStatusCode < 600) return true

  const graphQLErrorCode = getGraphqlErrorCode(error)
  if (graphQLErrorCode === 'RATE_LIMITED' || graphQLErrorCode === 'TOO_MANY_REQUESTS') return true

  return false
}

export const getBrands = async (): Promise<Brand[]> => {
  const client = await getClient()

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data } = await client.query({
        query: GET_SITEMAP_BRANDS
      })
      return data?.brands?.nodes ?? []
    } catch (error: unknown) {
      const shouldRetry = shouldRetrySitemapFetch(error)

      if (!shouldRetry || attempt === 2) {
        console.error('Failed to fetch sitemap brands', error)
        return []
      }

      const retryDelayMs = 300 * (attempt + 1)
      console.warn(
        `Retrying sitemap brands fetch after attempt ${attempt + 1} failed (next: ${attempt + 2}/3)`
      )
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
