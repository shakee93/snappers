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

export const GET_HERO_SETTINGS = gql`
query HeroSettings {
  heroSettings {
    heroSettingsFields {
      sliderSettings {
        slides {
          sliderTitle
          sliderDiscription
          titleColor
          descriptionColor
          buttonText
          buttonLink
          buttonTextColor
          buttonBachgroundColor
          sliderBackgroundImage {
            node {
              sourceUrl
            }
          }
        }
      }
      dealBannerSettings {
        deals {
          dealContent
          textPosition
          textColor
          backgroundImage {
            node {
              sourceUrl
            }
          }
        }
      }
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