import { gql } from "@apollo/client";

export const GET_GOOGLE_REVIEWS = gql`
  query GoogleReviews {
    googleReviews {
      googleReviewsFields {
        reviews {
          review
          reviewer
          stars
          reviewImages {
            nodes {
              id
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;
