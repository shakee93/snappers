import { gql } from '@apollo/client';
import { CategoryFragment } from './nav.fragments';

export const GET_NAV_CATEGORIES = gql`
query GetNavCategories {
  productCategories(first: 1000) {
    nodes {
      ...CategoryFields
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
        brandImage
      }
    }
  }
`;

export const GET_NESTED_CATEGORIES = gql`
query GetNestedProductCategoriesForArchive($parent: Int = 0) {
  productCategories(first: 100, where: {parent: $parent}) {
    nodes {
      ...CategoryFields
      children {
        nodes {
          ...CategoryFields
          children {
            nodes {
              ...CategoryFields
            }
          }
        }
      }
    }
  }
}
${CategoryFragment}
`;