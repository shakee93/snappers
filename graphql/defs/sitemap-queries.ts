import { gql } from "@apollo/client";

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
  query GetProducts {
    products(first: 2) {  
      nodes {
        ...ProductURLData
      }
    }
  }
  ${ProductURLData}
`;