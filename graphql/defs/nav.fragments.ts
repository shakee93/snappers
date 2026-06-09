import { gql } from "@apollo/client";

export const CategoryFragment = gql`
fragment CategoryFields on ProductCategory {
  id
  name
  slug
  databaseId
  parentDatabaseId
  image {
      id
      sourceUrl
      altText
      databaseId
    }
}
`;
