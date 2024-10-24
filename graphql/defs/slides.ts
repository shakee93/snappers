import { gql } from '@apollo/client';

export const GET_SLIDES = gql`
query SlidePostType {
    slides {
    nodes {
      databaseId
      title
      uri
      featureImage
      backgroundImage
      buttonLink
      buttonText
      subHeading
      mainHeading
      contentPosition
    }
  }
}
`