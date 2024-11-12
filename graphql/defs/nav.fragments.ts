import { gql } from "@apollo/client";

export const CategoryFragment = gql`
fragment CategoryFields on ProductCategory {
  name
  slug
  image {
      id
      sourceUrl
      altText
      databaseId
    }
}
`;
