import { BASE_URL } from '@/app/sitemap'
import type { MetadataRoute } from 'next'

const PAGES = [
  'about',
  'contact',
  'privacy',
  'warranty-terms',
  'terms-and-conditions'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    }
  ]

  // Add custom pages
  PAGES.forEach(page => {
    pageEntries.push({
      url: `${BASE_URL}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  })

  return pageEntries
} 