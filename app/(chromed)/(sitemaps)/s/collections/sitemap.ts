import { getClient } from '@/graphql/apollo-ssr'
import { GET_SITEMAP_COLLECTIONS } from '@/graphql/defs/sitemap-queries'
import { ProductCategory } from '@/graphql/types/graphql'
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/site.config'

const BASE_URL = siteConfig.url.base

// The SSR client retries transient 429s with backoff; if it still fails,
// degrade to an empty list so the sitemap build doesn't hard-fail — the root
// collection entries below still ship, and ISR/webhook revalidation backfills
// the per-collection URLs.
const getCollections = async (): Promise<ProductCategory[]> => {
  try {
    const client = await getClient()
    const { data } = await client.query({ query: GET_SITEMAP_COLLECTIONS })
    return data?.productCategories?.nodes ?? []
  } catch (error: unknown) {
    console.error('Failed to fetch sitemap collections', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collections = await getCollections()


  const collectionEntries: MetadataRoute.Sitemap = [
    // Root collections page
    {
      url: `${BASE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/collections/all`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }
  ]

  // Add individual collection pages
  collections.forEach(collection => {
    collectionEntries.push({
      url: `${BASE_URL}/collections/${collection.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  return collectionEntries
} 