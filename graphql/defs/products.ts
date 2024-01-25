import {gql} from "@apollo/client";
import {ProductContentFull, ProductSpecs} from "@/graphql/defs/products.fragments";

export const GET_BRANDS = gql`
  query getBrands($slug: [String] = []) {
    brands(first: 50, where: { orderby: COUNT, slug: $slug }) {
      nodes {
        id
        name
        slug
        databaseId
        description
        brandImage
      }
    }
  }
`;
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
  ${ProductSpecs}
  query GetProduct($productId: ID!) {
    product(id: $productId, idType: SLUG) {
      ...ProductContentFull
      ...ProductSpecs
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    productCategories(first: 100, where: { orderby: COUNT }) {
      nodes {
        name
        slug
        id
        databaseId
        count
      }
    }
    brands(first: 100, where: { orderby: COUNT }) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

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

export const GET_VARIATIONS_PRODUCT = gql`
  query GetAllProductVariations($categoryIdIn: [Int]) {
    products(first: 25, where: { categoryIdIn: $categoryIdIn }) {
      edges {
        node {
          name
          slug
          image {
            mediaItemUrl
            sourceUrl
          }
          ... on VariableProduct {
            name
            allPaCapacity {
              nodes {
                  name
                  slug
              }
          }
          allPaColor {
              nodes {
                  name
                  slug
              }
          }
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
                    sourceUrl
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

export const GET_BRAND = gql`
  query GetBrand($brandId: ID!) {
    brand(id: $brandId, idType: SLUG) {
      databaseId
      name
      slug
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($categoryId: ID!) {
    productCategory(id: $categoryId, idType: SLUG) {
      description
      name
      slug
      databaseId
    }
    productCategories(first: 100, where: { orderby: COUNT }) {
      nodes {
        name
        slug
        id
        databaseId
        count
      }
    }
    brands(first: 100, where: { orderby: COUNT }) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export const GET_BRAND_ARCHIVE = gql`
  query GetBrandArchive($brandId: [Int] = null, $categoryIdIn: [Int] = null) {
    products(
      first: 45
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: PWB_BRAND, ids: $brandId }
            { taxonomy: PRODUCT_CAT, ids: $categoryIdIn }
          ]
          relation: AND
        }
      }
    ) {
      edges {
        node {
          ...ProductContentFull
        }
      }
    }
  }
  ${ProductContentFull}
`;

export const GET_CATEGORY_ARCHIVE = gql`
  query GetCategoryArchive($categoryIdIn: [Int] = null, $first: Int = 10) {
    products(first: $first, where: { categoryIdIn: $categoryIdIn }) {
      edges {
        node {
          ...ProductContentFull
        }
      }
    }
  }
  ${ProductContentFull}
`;

export const GET_PRODUCTS_NODES = gql`
  query getProductsNode($categoryIdIn: [Int] = null, $first: Int = 10) {
    products(
      first: $first
      where: {
        categoryIdIn: $categoryIdIn
        stockStatus: IN_STOCK
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ...ProductContentFull
      }
    }
  }
  ${ProductContentFull}
`;

export const GET_PRODUCTS = gql`
  query GetProducts($categoryIdIn: [Int]) {
    products(first: 10, where: { categoryIdIn: $categoryIdIn }) {
      edges {
        node {
          id
          name
          slug
          averageRating
          reviewCount
          featured
          onSale
          description

          image {
            mediaItemUrl
            sourceUrl
            databaseId
          }
          type
          ... on SimpleProduct {
            id
            name
            stockStatus
            description
            galleryImages {
              edges {
                node {
                  mediaItemUrl
                  sourceUrl
                  databaseId
                }
              }
            }
            brands {
              nodes {
                id
                name
                slug
              }
            }
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
              edges {
                node {
                  name
                }
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
            description
            brands {
              nodes {
                id
                name
                slug
              }
            }
            allPaCapacity {
              nodes {
                  name
                  slug
              }
          }
          allPaColor {
              nodes {
                  name
                  slug
              }
          }
            productCategories {
              nodes {
                name
                slug
              }
              edges {
                node {
                  name
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
                    sourceUrl
                    sizes
                    databaseId
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
`;
export const GET_BRAND_DETAILS = gql`
  query GetBrandDetails($slug: [String]) {
    brands(first: 100, where: { slug: $slug }) {
      nodes {
        databaseId
        name
        slug
        count
        id
      }
    }
  }
`;
export const GET_TECH_SPEC = gql`
  query techspec($productId: ID!) {
    product(id: $productId, idType: DATABASE_ID) {
      id
      name
      metaData(key: "tech_spec") {
        id
        key
        value
      }
    }
  }
`;

export const GET_NEW_ARRIVALS = gql`
  query GET_NEW_ARRIVALS {
    products(where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ...ProductContentFull
      }
    }
  }
  ${ProductContentFull}
`;
