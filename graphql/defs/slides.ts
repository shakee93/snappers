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

/** Homepage hero carousel — Snappers ACF `sliderSettings` (no GQ-only color fields). */
export const GET_HERO_SLIDER_SETTINGS = gql`
  query HeroSliderSettings {
    heroSettings {
      heroSettingsFields {
        sliderSettings {
          slides {
            sliderTitle
            sliderDiscription
            buttonText
            buttonLink
            sliderBackgroundImage {
              node {
                sourceUrl
                altText
              }
            }
            sliderFeatureImage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    }
  }
`;

/** Deal banner countdown only — avoids coupling to the heavy hero/health query. */
export const GET_HERO_DEALS_DATE = gql`
  query HeroDealsDate {
    heroSettings {
      heroSettingsFields {
        dealsDate
      }
    }
  }
`;

export const GET_HERO_SETTINGS = gql`
  ${ProductContentCard}
query HeroSettings {
  heroSettings {
    heroSettingsFields {
      dealsDate
      sliderSettings {
        slides {
          sliderTitle
          sliderDiscription
          buttonText
          buttonLink
          sliderBackgroundImage {
            node {
              sourceUrl
              altText
            }
          }
          sliderFeatureImage {
            node {
              sourceUrl
              altText
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