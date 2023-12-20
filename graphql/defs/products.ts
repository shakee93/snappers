import { gql } from '@apollo/client';


export const GET_PRODUCT_SLUGS = gql`
    query productSlugs {
        products {
            nodes {
                slug
            }
        }
    }
`;


export const ProductContentFull = gql`
    fragment ProductContentFull on Product {
        id
        databaseId
        slug
        name
        type
        description
        shortDescription(format: RAW)
        image {
            id
            sourceUrl
            altText
        }
        galleryImages {
            nodes {
                id
                sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
                altText
            }
        }
        productTags(first: 20) {
            nodes {
                id
                slug
                name
            }
        }
        attributes {
            nodes {
                id
                attributeId
                ... on LocalProductAttribute {
                    name
                    options
                    variation
                }
                ... on GlobalProductAttribute {
                    name
                    options
                    variation
                }
            }
        }
        ... on SimpleProduct {
            onSale
            stockStatus
            price
            rawPrice: price(format: RAW)
            regularPrice
            salePrice
            stockStatus
            stockQuantity
            soldIndividually
        }
        ... on VariableProduct {
            onSale
            price
            rawPrice: price(format: RAW)
            regularPrice
            salePrice
            stockStatus
            stockQuantity
            soldIndividually
            variations(first: 50) {
                nodes {
                    id
                    databaseId
                    name
                    price
                    rawPrice: price(format: RAW)
                    regularPrice
                    salePrice
                    onSale
                    attributes {
                        nodes {
                            name
                            label
                            value
                        }
                    }
                }
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

export const GET_ALL_PRODUCTS_FILTER_CATEGORIES = gql`
    query GetAllProducts($categoryIdIn: [Int]) {
        products(first: 30,  where: {categoryIdIn: $categoryIdIn}) {
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
                    

                }
            }
        }
        productCategories(first: 100) {
            nodes {
                name
                slug
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
query GetAllProducts($categoryIdIn: [Int]) {
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