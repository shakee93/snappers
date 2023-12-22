import { gql } from '@apollo/client';
import { ProductContentFull } from "@/graphql/defs/products.fragments";


export const GET_BRANDS = gql`
    query getBrands {
        brands {
            nodes {
                name
                slug
            }
        }
    }
`
export const GET_PRODUCT_SLUGS = gql`
    query productSlugs {
        products {
            nodes {
                slug
            }
        }
    }
`;

export const GET_PRODUCT = gql`
    ${ProductContentFull}
    query GetProduct($productId: ID!) {
        product(id: $productId, idType: SLUG) {
            ...ProductContentFull
        }
    }
`;


export const GET_ALL_PRODUCTS = gql`
query GetAllProducts($categoryIdIn: [Int]) {
  products(first: 45, where: {categoryIdIn: $categoryIdIn}) {
    edges {
      node {
        name
        slug
        averageRating
        reviewCount
        onSale
        databaseId
        image {
          mediaItemUrl
          sourceUrl
        }
        type
        ... on SimpleProduct {
          id
          name
          stockStatus
          databaseId
          terms {
            nodes {
              ... on Brand {
                id
                name
                slug
              }
            }
          }
          productCategories {
            nodes {
              name
              slug
            }
          }
          price
          salePrice
          productTags {
            nodes {
              name
            }
          }
          galleryImages {
            nodes {
              id
              sourceUrl
            }
          }
        }
        ... on VariableProduct {
          name
          databaseId
          productCategories {
            nodes {
              name
              slug
            }
          }
          price
          productTags {
            nodes {
              name
            }
          }
          id
          variations {
            edges {
              node {
                id
                image {
                  mediaItemUrl
                  sizes
                }
                name
                price
                salePrice
              }
            }
          }
          galleryImages {
            edges {
              node {
                mediaItemUrl
                sourceUrl
              }
            }
          }
        }
      }
    }
  }
  productCategories(first: 100) {
    nodes {
        name
        slug
        id
        databaseId
    }
  }
}
`


export const GET_CATEGORY_SLUGS = gql`
    query productCategories {
        productCategories(first: 100) {
            nodes {
                name
                slug
            }
        }
    }
`;

export const GET_CATEGORY = gql`
    query GetProductCategory($categoryId: ID!) {
        productCategory(id: $categoryId, idType: SLUG) {
            description
            name
            slug
            databaseId
            image {
                link
            }
        }
    }
`;

export const GET_VARIATIONS_PRODUCT = gql`
query GetAllProductVariations($categoryIdIn: [Int]) {
    products(first: 25, where: {categoryIdIn: $categoryIdIn}) {
      edges {
        node {
          name
          slug
          image {
            mediaItemUrl
          }
          ... on VariableProduct {
            name
            productCategories {
              nodes {
                name
              }
            }
            price
            productTags {
              nodes {
                name
              }
            }
            id
            variations {
              edges {
                node {
                  id
                  image {
                    mediaItemUrl
                    sizes
                  }
                  name
                  price
                  salePrice
                }
              }
            }
          }
        }
      }
    }
  }
  `;


export const GET_BRAND_ARCHIVE = gql`
    query GetBrandArchive($brandId: ID!) {
        brand(id: $brandId, idType: SLUG) {
            id
            name
            description
        }
        productCategories(first: 100) {
            nodes {
                name
                slug
                id
                databaseId
            }
        }
        brands(first: 100) {
            nodes {
                id
                name
                slug
            }
        } 
        products(first: 25) {
            edges {
                node {
                    ...ProductContentFull
                }
            }
        }
    }
    ${ProductContentFull} 
`

export const GET_PRODUCTS = gql`
query GetAllProducts($categoryIdIn: [Int]) {
  products(first: 10, where: {categoryIdIn: $categoryIdIn}) {
    edges {
      node {
        name
        slug
        averageRating
        reviewCount
        featured
        onSale
        image {
          mediaItemUrl
        }
        type
        ... on SimpleProduct {
          id
          name
          stockStatus
          terms {
            nodes {
              ... on Brand {
                id
                name
                slug
              }
            }
          }
          productCategories {
            nodes {
              name
            }
          }
          price
          salePrice
          productTags {
            nodes {
              name
            }
          }
          databaseId
        }
        ... on VariableProduct {
          name
          productCategories {
            nodes {
              name
            }
          }
          price
          productTags {
            nodes {
              name
            }
          }
          id
          variations {
            edges {
              node {
                id
                image {
                  mediaItemUrl
                  sizes
                }
                name
                price
                salePrice
              }
            }
          }
          averageRating
          reviewCount
          databaseId
        }
      }
    }
  }
}
`