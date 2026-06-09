import { gql } from "@apollo/client";

// Single source of truth for the WooCommerce BOGO plugin meta keys.
// Use BogoPluginMetaOnProduct for Product types and BogoPluginMetaOnVariation
// for ProductVariation — the key list lives only here, so adding/removing a
// plugin field is a one-line change.
export const BogoPluginMetaOnProduct = gql`
  fragment BogoPluginMetaOnProduct on Product {
    bogoPluginMeta: metaData(
      keysIn: [
        "_wc_bogo_enabled"
        "_wc_bogo_buy_qty"
        "_wc_bogo_get_qty"
        "_wc_bogo_max_free_qty"
        "_wc_bogo_free_product_ids"
        "_wc_bogo_free_product_id"
      ]
    ) {
      key
      value
      id
    }
  }
`;

export const BogoPluginMetaOnVariation = gql`
  fragment BogoPluginMetaOnVariation on ProductVariation {
    bogoPluginMeta: metaData(
      keysIn: [
        "_wc_bogo_enabled"
        "_wc_bogo_buy_qty"
        "_wc_bogo_get_qty"
        "_wc_bogo_max_free_qty"
        "_wc_bogo_free_product_ids"
        "_wc_bogo_free_product_id"
      ]
    ) {
      key
      value
    }
  }
`;

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
    stockStatus
    stockQuantity
    manageStock
    # Per-variation free-shipping flag (BOGO plugin meta). Variation value
    # wins; the parent's value is the fallback when this is empty.
    freeShippingMeta: metaData(keysIn: ["_wc_product_free_shipping"]) {
      key
      value
    }
  }
`;

// Slim fragment used by listing cards (homepage sliders, archives, search).
// Covers every field ProductCard3 + AddedToCart + useProductLink read.
// For PDP-only fields (description, galleryImages, upsell, attributes,
// happiestCustomersGallery, etc.) use ProductContentFull below.
export const ProductContentCard = gql`
  ${BogoPluginMetaOnProduct}
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
    metaData(
      keysIn: [
        "tech_spec"
        "tech_spec_data"
        "warranty_type"
        "warranty_period"
        "inside_the_box"
      ]
    ) {
      key
      value
      id
    }
    ...BogoPluginMetaOnProduct
    productTags(first: 20) {
      nodes {
        id
        slug
        name
      }
    }
    productCategories {
      nodes {
        slug
        name
        parentDatabaseId
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
              # "label" is required by AddedToCart's dynamic product[allPa + label]
              # lookup. Kept on the card fragment so any future listing-card path
              # that passes a variation into AddedToCart works without a silent break.
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

export const ProductContentFull = gql`
  ${BogoPluginMetaOnProduct}
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
        brandImage
      }
    }
    metaData(
      keysIn: [
        "tech_spec"
        "tech_spec_data"
        "warranty_type"
        "warranty_period"
        "inside_the_box"
      ]
    ) {
      key
      value
      id
    }
    # WooCommerce BOGO plugin meta is often omitted from unfiltered metaData; fetch explicitly.
    ...BogoPluginMetaOnProduct
    # Parent free-shipping flag (used as fallback when a variation's value is empty).
    freeShippingMeta: metaData(keysIn: ["_wc_product_free_shipping"]) {
      key
      value
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
    # Upsells render through ProductCard3 (via SectionSliderProductCard), identical
    # to listing cards — reuse ProductContentCard to avoid duplicating the full
    # variable-product + taxonomy tree per upsell.
    upsell {
      nodes {
        ...ProductContentCard
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
            parentDatabaseId
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
            parentDatabaseId
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
          # Per-variation free-shipping flag. Variation value wins; parent
          # freeShippingMeta above is the fallback when this is empty.
          freeShippingMeta: metaData(keysIn: ["_wc_product_free_shipping"]) {
            key
            value
          }
        }
      }
    }
  }
`;
