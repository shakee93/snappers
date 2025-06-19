import { gql } from "@apollo/client";

export const ProductSpecs = gql`
  fragment ProductSpecs on Product {
    metaData(key: "tech_spec") {
      id
      key
      value
    }
  }
`;
export const ProductContentSlice = gql`
  fragment ProductContentSlice on Product {
    id
    databaseId
    name
    slug
    type
    purchasable
    description
    shortDescription(format: RAW)
    brands {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
    image {
      id
      sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
      altText
    }
    ... on SimpleProduct {
      price
      regularPrice
      soldIndividually
      brands {
        nodes {
          id
          name
          slug
        }
      }
    }
    productCategories {
      nodes {
        id
        name
      }
    }
    ... on VariableProduct {
      allPaCapacity {
        nodes {
          name
          slug
        }
      }
      allPaConnectivity {
        nodes {
          name
          slug
        }
      }
      allPaColor {
        nodes {
          name
          slug
        }
      }
      allPaColour {
        nodes {
          name
          slug
        }
      }
      allPaSpecification {
        nodes {
          name
          slug
        }
      }
      allPaVariant {
        nodes {
          name
          slug
        }
      }
      allPaWarranty {
        nodes {
          name
          slug
        }
      }
      allPaModel {
        nodes {
          name
          slug
        }
      }
      allPaPacks {
        nodes {
          name
          slug
        }
      }
      allPaWatchSize {
        nodes {
          name
          slug
        }
      }
      allPaSize {
        nodes {
          name
          slug
        }
      }
      allPaConnectorType {
        nodes {
          name
          slug
        }
      }
      allPaAmount {
        nodes {
          name
          slug
        }
      }

      price
      regularPrice
      soldIndividually
      brands {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;



export const ProductVariationContentSlice = gql`
  fragment ProductVariationContentSlice on ProductVariation {
    id
    databaseId
    name
    slug
    image {
      id
      sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
      altText
    }
    price
    regularPrice
  }
`;

export const ProductContentFull = gql`
  fragment ProductContentFull on Product {
    id
    databaseId
    slug
    name
    type
    description
    shortDescription(format: RAW)
    reviewCount
    image {
      id
      sourceUrl
      altText
      databaseId
    }
    brands {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
    metaData {
      key
      value
      id
    }
    galleryImages {
      nodes {
        id
        sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
        altText
        databaseId
      }
    }
    productTags(first: 20) {
      nodes {
        id
        slug
        name
      }
    }
    attributes {
      nodes {
        id
        attributeId
        name
        label
        options
      }
    }
    upsell {
      nodes {
        id
        name
        databaseId
        onSale
        slug
        type
        image {
          altText
          link
          sourceUrl
        }
        type

        ... on SimpleProduct {
          onSale
          stockStatus
          price
          rawPrice: price(format: RAW)
          regularPrice
          salePrice
          stockStatus
          purchasable
          stockQuantity
          soldIndividually
          productCategories {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
          galleryImages {
            nodes {
              id
              sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
              altText
              databaseId
            }
          }
          brands {
            nodes {
              databaseId
              name
              slug
              count
            }
          }
        }
        ... on VariableProduct {
          allPaCapacity {
            nodes {
              name
              slug
            }
          }
          allPaColor {
            nodes {
              name
              slug
            }
          }
          allPaColour {
            nodes {
              name
              slug
            }
          }
          allPaSpecification {
            nodes {
              name
              slug
            }
          }
          allPaVariant {
            nodes {
              name
              slug
            }
          }
          allPaWarranty {
            nodes {
              name
              slug
            }
          }
          allPaModel {
            nodes {
              name
              slug
            }
          }
          allPaWatchSize {
            nodes {
              name
              slug
            }
          }
          allPaConnectivity {
            nodes {
              name
              slug
            }
          }
          allPaPacks {
            nodes {
              name
              slug
            }
          }
          allPaSize {
            nodes {
              name
              slug
            }
          }
          allPaConnectorType {
            nodes {
              name
              slug
            }
          }
          allPaBandType {
            nodes {
              name
              slug
            }
          }
          allPaShape {
            nodes {
              name
              slug
            }
          }
          allPaCompatibility {
            nodes {
              name
              slug
            }
          }
          allPaNetwork {
            nodes {
              name
              slug
            }
          }
          allPaAmount {
            nodes {
              name
              slug
            }
          }

          onSale
          price
          rawPrice: price(format: RAW)
          regularPrice
          salePrice
          stockStatus
          purchasable
          stockQuantity
          soldIndividually
          defaultAttributes {
            nodes {
              id
              name
              label
              value
            }
          }
          globalAttributes {
            nodes {
              id
              slug
              name
              label
            }
          }
          productCategories {
            edges {
              node {
                id
                databaseId
                name
                slug
              }
            }
          }
          galleryImages {
            nodes {
              id
              sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
              altText
              databaseId
            }
          }
          brands {
            nodes {
              databaseId
              name
              slug
              count
            }
          }
          variations(first: 50) {
            nodes {
              id
              databaseId
              name
              price
              stockStatus
              stockQuantity
              rawPrice: price(format: RAW)
              regularPrice
              salePrice
              onSale
              image {
                sourceUrl
                id
                databaseId
              }

              attributes {
                nodes {
                  id
                  name
                  label
                  value
                }
              }
            }
          }
        }
      }
    }
    ... on SimpleProduct {
      onSale
      stockStatus
      price
      rawPrice: price(format: RAW)
      regularPrice
      salePrice
      stockStatus
      purchasable
      stockQuantity
      soldIndividually
      productCategories {
        edges {
          node {
            id
            name
            slug
          }
        }
      }
      galleryImages {
        nodes {
          id
          sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
          altText
          databaseId
        }
      }
    }
    ... on VariableProduct {
      allPaCapacity {
        nodes {
          name
          slug
        }
      }
      allPaColor {
        nodes {
          name
          slug
        }
      }
      allPaColour {
        nodes {
          name
          slug
        }
      }
      allPaSpecification {
        nodes {
          name
          slug
        }
      }
      allPaVariant {
        nodes {
          name
          slug
        }
      }
      allPaWarranty {
        nodes {
          name
          slug
        }
      }
      allPaModel {
        nodes {
          name
          slug
        }
      }
      allPaWatchSize {
        nodes {
          name
          slug
        }
      }
      allPaConnectivity {
        nodes {
          name
          slug
        }
      }
      allPaPacks {
        nodes {
          name
          slug
        }
      }
      allPaSize {
        nodes {
          name
          slug
        }
      }
      allPaConnectorType {
        nodes {
          name
          slug
        }
      }
      allPaBandType {
        nodes {
          name
          slug
        }
      }
      allPaShape {
        nodes {
          name
          slug
        }
      }
      allPaCompatibility {
        nodes {
          name
          slug
        }
      }
      allPaNetwork {
        nodes {
          name
          slug
        }
      }
      allPaAmount {
        nodes {
          name
          slug
        }
      }
      onSale
      price
      rawPrice: price(format: RAW)
      regularPrice
      salePrice
      stockStatus
      purchasable
      stockQuantity
      soldIndividually
      defaultAttributes {
        nodes {
          id
          name
          label
          value
        }
      }
      globalAttributes {
        nodes {
          id
          slug
          name
          label
        }
      }
      productCategories {
        edges {
          node {
            id
            databaseId
            name
            slug
          }
        }
      }
      galleryImages {
        nodes {
          id
          sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
          altText
          databaseId
        }
      }
      variations(first: 50) {
        nodes {
          id
          databaseId
          name
          price
          stockStatus
          stockQuantity
          rawPrice: price(format: RAW)
          regularPrice
          salePrice
          onSale
          image {
            sourceUrl
            id
            databaseId
          }
          attributes {
            nodes {
              id
              name
              label
              value
            }
          }
        }
      }
    }
  }
`;
