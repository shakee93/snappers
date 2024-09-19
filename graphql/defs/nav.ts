import { gql } from '@apollo/client';
import { CategoryFragment } from './nav.fragments';

export const GET_NAV_CATEGORIES = gql`
query GetNestedProductCategories {
  productCategories(first: 100, where: { parent: null }) {
    nodes {
      ...CategoryFields
      children {
        nodes {
          ...CategoryFields
          children {
            nodes {
              ...CategoryFields
              # You can add more levels if needed
            }
          }
        }
      }
    }
  }
}
${CategoryFragment}
`

export const GET_NAV_BRANDS = gql`
  query GetNavBrands {
    brands(first: 100) {
      nodes {
        id
        name
        slug
      }
    }
  }
`;