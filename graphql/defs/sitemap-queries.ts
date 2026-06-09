import { gql } from "@apollo/client";
import { BrandIdType } from "../types/graphql";

export const ProductURLData = gql`
  fragment ProductURLData on Product {
    id
    name
    slug
    ... on SimpleProduct {
      brands {
        nodes {
          name
          slug
        }
      }
    }
    ... on VariableProduct {
      brands {
        nodes {
          name
          slug
        }
      }
    }
  }
`;


export const GET_SITEMAP_PRODUCTS = gql`
  query GetSitemapProducts {
    products(first: 2) {  
      nodes {
        ...ProductURLData
      }
    }
  }
  ${ProductURLData}
`;

export const GET_SITEMAP_PRODUCTS_BY_BRAND = gql`
  query GetProductsByBrand($brandSlug: [String]) {
    products(
      first: 100
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: PWB_BRAND, terms: $brandSlug }
          ]
        }
      }
    ) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          brands {
            nodes {
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          brands {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  }
`;
export const GET_BRAND_PRODUCTS = gql`
  query GetBrandProducts($brandSlug: ID!, $idType: BrandIdType!, $after: String) {
    brand(id: $brandSlug, idType: $idType) {
      brandId
      products(first: 100, after: $after) {
        nodes {
          id
          slug
          modified
          productCategories {
            nodes {
              slug
              parentDatabaseId
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_SITEMAP_BRANDS = gql`
  query GetSitemapBrands {
    brands(first: 100) {
      nodes {
        id
        name
        slug
      }
    }
  }
`;

export const GET_SITEMAP_COLLECTIONS = gql`
  query GetSitemapCollections {
    productCategories(first: 100, where: { orderby: COUNT }) {
      nodes {
        name
        slug
        id
        databaseId
        count
      }
    }
  }
`;
