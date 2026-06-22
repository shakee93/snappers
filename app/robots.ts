import type { MetadataRoute } from 'next'
import { siteConfig } from '@/site.config'

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.seo.indexable) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${siteConfig.url.base}/sitemap.xml`,
  }
}