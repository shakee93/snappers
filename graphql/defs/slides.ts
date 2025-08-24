import { gql } from '@apollo/client';

export const GET_SLIDES = gql`
query SlidePostType {
    slides {
    nodes {
      uri
      slidePriority
      backgroundImage
      mobileBackgroundImage
      tabletBackgroundImage
      buttonLink
      buttonText
      subHeading
      mainHeading
      contentPosition
    }
  }
}
`

export const GET_REVIEWS = gql`
query getReviews {
  customerReviewFields {
    quote
    review
    reviewer_name
  }
}
`