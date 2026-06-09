import { BASE_URL, getBrands } from '@/app/sitemap-helpers'
import { getProductPath } from '@/lib/productUrl'
import { Brand } from '@/graphql/types/graphql';
import { HIDDEN_PRODUCT_SLUGS } from '@/lib/hidden-products';
import type { MetadataRoute } from 'next'
import { getClient } from '@/graphql/apollo-ssr'
import { GET_BRAND_PRODUCTS } from '@/graphql/defs/sitemap-queries'
import { GET_BRAND_DETAILS } from '@/graphql/defs/products'
import { BrandIdType } from '@/graphql/types/graphql'

export const revalidate = 86400         // ISR: refresh once per day; warm on first crawler hit
export const runtime = 'nodejs'



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

    // Paginate through all products for the brand (sitemap spec allows up to
    // 50k URLs per file; the GraphQL `first` limit is 100, so loop until
    // hasNextPage is false).
    const products: {
      id: number;
      date: string;
      slug: string;
      productCategories?: {
        nodes?: Array<{
          slug?: string | null;
          parentDatabaseId?: number | null;
        } | null> | null;
      } | null;
    }[] = []
    let after: string | null = null
    // Hard ceiling: 500 pages * 100 = 50k URLs (sitemap spec limit).
    for (let page = 0; page < 500; page++) {
      const result = await client.query({
        query: GET_BRAND_PRODUCTS,
        variables: {
          brandSlug: brandId,
          idType: BrandIdType.DatabaseId,
          after,
        },
      });

      if (result.errors) {
        console.error("Product errors", result.errors);
      }

      const productsConn = result.data?.brand?.products as
        | {
            nodes?: {
              id: string;
              slug: string;
              modified?: string | null;
              productCategories?: {
                nodes?: Array<{
                  slug?: string | null;
                  parentDatabaseId?: number | null;
                } | null> | null;
              } | null;
            }[] | null;
            pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null;
          }
        | undefined
      const nodes = productsConn?.nodes
      if (!nodes?.length) break

      for (const product of nodes) {
        products.push({
          id: parseInt(product.id.split('_').pop() || '0'),
          slug: product.slug,
          date: product.modified || new Date().toISOString(),
          productCategories: product.productCategories,
        })
      }

      const pageInfo = productsConn?.pageInfo
      if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break
      after = pageInfo.endCursor
    }

    return products
  } catch (error) {
    console.error('Error fetching products for brand:', brandSlug, error)
    return []
  }
}

export async function generateSitemaps() {
  const brands = await getBrands()
  
  const list =brands.map((brand: Brand) => ({
    id: brand.slug,
  }))
  return list
}


export default async function sitemap({ id }: { id: Promise<string> | string }): Promise<MetadataRoute.Sitemap> {
  const slug = await id
  // slug example: apple, samsung, huawei, oppo

  const products = await getProducts(slug)

  return products
    .filter((product) => !HIDDEN_PRODUCT_SLUGS.has(product.slug.toLowerCase()))
    .map((product) => ({
      url: `${BASE_URL}${getProductPath(product)}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: product.date,
    }))
}
