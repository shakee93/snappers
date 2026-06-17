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

export const WRITE_PRODUCT_REVIEW = gql`
  mutation WriteProductReview($input: WriteReviewInput!) {
    writeReview(input: $input) {
      rating
    }
  }
`;
