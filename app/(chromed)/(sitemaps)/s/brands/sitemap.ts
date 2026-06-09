import { BASE_URL, getBrands } from '@/app/sitemap-helpers'
import { getBrandPath } from '@/lib/productUrl'
import type { MetadataRoute } from 'next'



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = await getBrands()


  const brandEntries: MetadataRoute.Sitemap = [
    // Root brands page
    {
      url: `${BASE_URL}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }
  ]

  // Add individual brand pages
  brands.forEach(brand => {
    brandEntries.push({
      url: `${BASE_URL}${getBrandPath(brand.slug ?? '')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  return brandEntries
} 