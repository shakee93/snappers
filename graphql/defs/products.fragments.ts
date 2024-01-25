import {gql} from "@apollo/client";

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
      allPaWatchSize {
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
      allPaWatchSize {
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
          name
          label
          value
        }
      }
      globalAttributes {
        nodes {
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
