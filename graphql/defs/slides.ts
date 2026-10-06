import { gql } from '@apollo/client';
import { ProductContentCard } from './products.fragments';

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

/** Snappers (and similar): hero carousel from `hero_slide` CPT + ACF `heroSlideFields`. */
export const GET_HERO_SLIDES = gql`
  query HeroSlides {
    heroSlides(first: 10, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        databaseId
        heroSlideFields {
          mainTitle
          subContent
          buttonText
          buttonUrl
          backgroundImage {
            node {
              sourceUrl
              altText
            }
          }
          featureImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export const GET_HERO_SETTINGS = gql`
  ${ProductContentCard}
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
      healthSectionSettings {
        healthProduct {
          featureImage {
            node {
              sourceUrl
            }
          }
          healthProduct {
            edges {
              node {
                ... on Product {
                  shortDescription(format: RAW)
                  description(format: RAW)
                  ...ProductContentCard
                }
              }
            }
          }
        }
      }
    }
  }
}
`