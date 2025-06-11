import { BASE_URL, getBrands } from '@/app/sitemap'
import { Brand } from '@/graphql/types/graphql';
import type { MetadataRoute } from 'next'
import { getClient } from '@/graphql/apollo-ssr'
import { GET_BRAND_PRODUCTS } from '@/graphql/defs/sitemap-queries'
import { GET_BRAND_DETAILS } from '@/graphql/defs/products'
import { BrandIdType } from '@/graphql/types/graphql'


async function getProducts(brandSlug: string): Promise<{ id: number; date: string; slug: string }[]> {

  try {
    const client = await getClient()
    
    // First, get the brand ID using the slug
    const { data: brandData, errors: brandErrors } = await client.query({
      query: GET_BRAND_DETAILS,
      variables: {
        slug: [brandSlug],
      },
    });
    
    if (brandErrors) {
      console.error("Brand errors", brandErrors);
      return [];
    }
    
    if (!brandData?.brands?.nodes || brandData.brands.nodes.length === 0) {
      console.error("Brand not found for slug:", brandSlug);
      return [];
    }
    
    const brand = brandData.brands.nodes[0];
    const brandId = brand.databaseId;
    
    // Now get the products using the brand ID
    const { data, errors } = await client.query({
      query: GET_BRAND_PRODUCTS,
      variables: {
        brandSlug: brandId,
        idType: BrandIdType.DatabaseId,
      },
    });
    
    if (errors) {
      console.error("Product errors", errors);
    }

    if (data?.brand?.products?.nodes) {
      return data.brand.products.nodes.map((product: any) => ({
        id: parseInt(product.id.split('_').pop() || '0'),
        slug: product.slug,
        date: product.modified || new Date().toISOString(),
      }))
    }

    return []
  } catch (error) {
    console.error('Error fetching products for brand:', brandSlug, error)
    return []
  }
}

export async function generateSitemaps() {
  const brands = await getBrands()
  
  return brands.map((brand: Brand) => ({
    id: brand.slug,
  }))
}

export default async function sitemap(id: { id: string }): Promise<MetadataRoute.Sitemap> {
  const slug = id.id
  // slug example: apple, samsung, huawei, oppo

  const products = await getProducts(slug)
  console.log("products", products);

  return products.map((product) => ({ 
    url: `${BASE_URL}/product/${product.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
    lastModified: product.date,
  }))
}
