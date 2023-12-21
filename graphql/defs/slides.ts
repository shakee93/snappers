import { gql } from '@apollo/client';

export const GET_SLIDES = gql`
query SlidePostType {
    slides {
      nodes {
        id
        slideFields {
          mainHeading
          subHeading
          buttonText
          buttonLink
                  featureImage {
              id
              sourceUrl(size: MEDIUM)
            }
        }
      }
    }
  }
`