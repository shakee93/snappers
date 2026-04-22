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
        brandImage
      }
    }
    image {
      id
      sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
      altText
    }
    productTags(first: 20) {
      nodes {
        id
        slug
        name
      }
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

// Slim fragment used by listing cards (homepage sliders, archives, search).
// Covers every field ProductCard3 + AddedToCart + useProductLink read.
// For PDP-only fields (description, galleryImages, upsell, attributes,
// happiestCustomersGallery, etc.) use ProductContentFull below.
export const ProductContentCard = gql`
  fragment ProductContentCard on Product {
    id
    databaseId
    slug
    name
    type
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
        brandImage
      }
    }
    metaData {
      key
      value
      id
    }
    bogoPluginMeta: metaData(
      keysIn: [
        "_wc_bogo_enabled",
        "_wc_bogo_buy_qty",
        "_wc_bogo_get_qty",
        "_wc_bogo_max_free_qty",
        "_wc_bogo_free_product_ids",
        "_wc_bogo_free_product_id"
      ]
    ) {
      key
      value
      id
    }
    productTags(first: 20) {
      nodes {
        id
        slug
        name
      }
    }
    ... on SimpleProduct {
      onSale
      stockStatus
      price
      rawPrice: price(format: RAW)
      regularPrice
      salePrice
    }
    ... on VariableProduct {
      # allPa* fields are dynamically accessed by AddedToCart at
      # product[allPa+label], so they must stay on the card fragment.
      allPaCapacity { nodes { name slug } }
      allPaColor { nodes { name slug } }
      allPaColour { nodes { name slug } }
      allPaSpecification { nodes { name slug } }
      allPaVariant { nodes { name slug } }
      allPaWarranty { nodes { name slug } }
      allPaModel { nodes { name slug } }
      allPaWatchSize { nodes { name slug } }
      allPaConnectivity { nodes { name slug } }
      allPaPacks { nodes { name slug } }
      allPaSize { nodes { name slug } }
      allPaConnectorType { nodes { name slug } }
      allPaBandType { nodes { name slug } }
      allPaShape { nodes { name slug } }
      allPaCompatibility { nodes { name slug } }
      allPaNetwork { nodes { name slug } }
      allPaAmount { nodes { name slug } }

      onSale
      price
      rawPrice: price(format: RAW)
      regularPrice
      salePrice
      stockStatus
      variations(first: 50) {
        nodes {
          price
          regularPrice
          stockStatus
          image {
            sourceUrl
          }
          attributes {
            nodes {
              # "label" is intentionally omitted. AddedToCart reads it via
              # product[allPa + label], but is only invoked with a variation
              # from the PDP, where ProductContentFull supplies label. If a
              # listing card ever passes a variation into AddedToCart, add
              # label here too.
              name
              value
            }
          }
        }
      }
    }
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
    productVideoUrl
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
        brandImage
      }
    }
    metaData {
      key
      value
      id
    }
    # WooCommerce BOGO plugin meta is often omitted from unfiltered metaData; fetch explicitly.
    bogoPluginMeta: metaData(
      keysIn: [
        "_wc_bogo_enabled",
        "_wc_bogo_buy_qty",
        "_wc_bogo_get_qty",
        "_wc_bogo_max_free_qty",
        "_wc_bogo_free_product_ids",
        "_wc_bogo_free_product_id"
      ]
    ) {
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
      happiestCustomersGallery
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
      happiestCustomersGallery
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
