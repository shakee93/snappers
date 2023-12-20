import { gql } from '@apollo/client';
import {ProductContentFull} from "@/graphql/defs/products.fragments";


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
        products(first: 45,  where: {categoryIdIn: $categoryIdIn}) {
            edges {
                node {
                    name
                    slug
                    image {
                        mediaItemUrl
                    }
                    type
                    ... on SimpleProduct {
                        id
                        name
                        stockStatus
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