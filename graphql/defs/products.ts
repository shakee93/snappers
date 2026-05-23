import { gql } from "@apollo/client";
import {
  BogoPluginMetaOnProduct,
  BogoPluginMetaOnVariation,
  ProductContentCard,
  ProductContentFull,
} from "@/graphql/defs/products.fragments";

export const GET_BRANDS = gql`
  query getBrands($slug: [String] = []) {
    brands(first: 50, where: { orderby: COUNT, slug: $slug }) {
      nodes {
        id
        name
        slug
        databaseId
        description
        brandImage
      }
    }
  }
`;
export const GET_PRODUCT_SLUGS = gql`
  query productSlugs {
    products {
      nodes {
        slug
      }
    }
  }
`;

export const GET_ALL_BRANDS = gql`
  query getAllBrands {
    brands(first: 100, where: { orderby: COUNT }) {
      nodes {
        name
        slug
        databaseId
        count
        brandImage
      }
    }
  }
`;


export const GET_PRODUCT = gql`
  ${ProductContentCard}
  ${ProductContentFull}
  ${BogoPluginMetaOnVariation}
  query GetProduct($productId: ID!) {
    product(id: $productId, idType: SLUG) {
      ...ProductContentFull
      # Per-variation BOGO rule (variation meta wins, parent meta is the
      # fallback). PDP-only — kept out of ProductContentFull so brand /
      # category / homepage archives that share that fragment don't pay
      # the extra per-variation meta fetch.
      ... on VariableProduct {
        variations(first: 50) {
          nodes {
            databaseId
            ...BogoPluginMetaOnVariation
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_DATABASE_IDS = gql`
  query GetProductsByDatabaseIds($ids: [Int]) {
    products(first: 25, where: { include: $ids }) {
      nodes {
        databaseId
        name
        slug
        image {
          sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
        }
        featuredImage {
          node {
            sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
          }
        }
        brands {
          nodes {
            slug
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_DATABASE_ID = gql`
  query GetProductByDatabaseId($id: ID!) {
    product(id: $id, idType: DATABASE_ID) {
      databaseId
      name
      slug
      image {
        sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
      }
      featuredImage {
        node {
          sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
        }
      }
      ... on SimpleProduct {
        brands {
          nodes {
            slug
          }
        }
      }
      ... on VariableProduct {
        brands {
          nodes {
            slug
          }
        }
      }
    }
  }
`;

/** Batch-fetch BOGO plugin meta for InstantSearch / Typesense hits (no Woo meta on the hit). */
export const GET_PRODUCTS_BOGO_PLUGIN_META = gql`
  ${BogoPluginMetaOnProduct}
  query GetProductsBogoPluginMeta($ids: [Int]) {
    products(first: 100, where: { include: $ids }) {
      nodes {
        databaseId
        ...BogoPluginMetaOnProduct
      }
    }
  }
`;

export const GET_PRODUCT_VARIATION_BY_DATABASE_ID = gql`
  query GetProductVariationByDatabaseId($id: ID!) {
    productVariation(id: $id, idType: DATABASE_ID) {
      databaseId
      name
      image {
        sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
      }
      parent {
        node {
          databaseId
          name
          slug
          image {
            sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
          }
          featuredImage {
            node {
              sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
            }
          }
          ... on VariableProduct {
            brands {
              nodes {
                slug
              }
            }
          }
        }
      }
    }
  }
`;


export const GET_TAG_DETAILS_BY_SLUG = gql`
  query GetTagDetailsBySlug($slug: [String]!) {
    productTags(where: {slug: $slug }) {
      nodes {
        id
        name,
        slug,
        description
      }
  }
}
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    productCategories(first: 100, where: { orderby: COUNT }) {
      nodes {
        name
        slug
        id
        databaseId
        count
      }
    }
    brands(first: 100, where: { orderby: COUNT }) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export const GET_CATEGORY_SLUGS = gql`
  query productCategories {
    productCategories(first: 100) {
      nodes {
        name
        slug
      }
    }
  }
`;

export const GET_VARIATIONS_PRODUCT = gql`
  query GetAllProductVariations($categoryIdIn: [Int]) {
    products(first: 25, where: { categoryIdIn: $categoryIdIn }) {
      edges {
        node {
          name
          slug
          image {
            mediaItemUrl
            sourceUrl
          }
          ... on VariableProduct {
            name
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
            productCategories {
              nodes {
                name
              }
            }
            price
            productTags {
              nodes {
                name
                slug
              }
            }
            id
            variations {
              edges {
                node {
                  id
                  image {
                    mediaItemUrl
                    sourceUrl
                    sizes
                  }
                  name
                  price
                  salePrice
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_BRAND = gql`
  query GetBrand($brandId: ID!) {
    brand(id: $brandId, idType: SLUG) {
      description
      databaseId
      name
      slug
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($categoryId: ID!) {
    productCategory(id: $categoryId, idType: SLUG) {
      description
      name
      slug
      databaseId
    }
    productCategories(first: 100, where: { orderby: COUNT }) {
      nodes {
        name
        slug
        id
        databaseId
        count
      }
    }
    brands(first: 100, where: { orderby: COUNT }) {
      nodes {
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export const GET_BRAND_ARCHIVE = gql`
  query GetBrandArchive($brandId: [Int] = null, $categoryIdIn: [Int] = null) {
    products(
      first: 45
      where: {
        taxonomyFilter: {
          filters: [
            { taxonomy: PWB_BRAND, ids: $brandId }
            { taxonomy: PRODUCT_CAT, ids: $categoryIdIn }
          ]
          relation: AND
        }
      }
    ) {
      edges {
        node {
          ...ProductContentCard
        }
      }
    }
  }
  ${ProductContentCard}
`;

export const GET_CATEGORY_ARCHIVE = gql`
  query GetCategoryArchive($categoryIdIn: [Int] = null, $first: Int = 10) {
    products(first: $first, where: { categoryIdIn: $categoryIdIn }) {
      edges {
        node {
          ...ProductContentCard
        }
      }
    }
  }
  ${ProductContentCard}
`;

export const GET_CATEGORY_ARCHIVE_IN_STOCK = gql`
  query GetCategoryArchiveInStock($categoryIdIn: [Int] = null, $first: Int = 10) {
    products(first: $first, where: { categoryIdIn: $categoryIdIn, stockStatus: IN_STOCK }) {
      edges {
        node {
          ...ProductContentCard
        }
      }
    }
  }
  ${ProductContentCard}
`;

export const GET_PRODUCTS_NODES = gql`
  query getProductsNode($categoryIdIn: [Int] = null, $first: Int = 10) {
    products(
      first: $first
      where: {
        categoryIdIn: $categoryIdIn
        stockStatus: IN_STOCK
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ...ProductContentCard
      }
    }
  }
  ${ProductContentCard}
`;

export const GET_BENTO_SLIDER = gql`
query HeroSection {
  mainSlidesMiddleRows {
    slides {
      image
      url
    }
  }
  sideSlider {
    image
    url
  }
  featuresSlide {
    name
    slug
    salePrice
    regularPrice
    price
    imageUrl
    currency
  }
  saleProduct {
    name
    slug
    currency
    imageUrl
    price
    regularPrice
    salePrice
  }
  tiktokVideo {
    tiktokLink
    videoUrl
    productLink
  }
}
`

export const GET_PRODUCTS_NODES_HOMEPAGE = gql`
  query getProductsNodeHomePage($first: Int = 10, $tagId: Int!) {
    products(
      first: $first
      where: {
      tagId: $tagId
    stockStatus: IN_STOCK
    }
    ) {
      nodes {
        ...ProductContentCard
      }
    }
  }
  ${ProductContentCard}
`;

/** Products tagged for BOGO / free offers (WP plugin syncs tag slug `bogo-offer`). */
export const GET_PRODUCTS_BY_BOGO_TAG = gql`
  query GetProductsByBogoTag($first: Int = 50, $tagIn: [String] = ["bogo-offer"]) {
    products(
      first: $first
      where: { tagIn: $tagIn, stockStatus: IN_STOCK, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...ProductContentCard
      }
    }
  }
  ${ProductContentCard}
`;

export const GET_PRODUCTS = gql`
  query GetProducts($categoryIdIn: [Int]) {
    products(first: 10, where: { categoryIdIn: $categoryIdIn }) {
      edges {
        node {
          id
          name
          slug
          averageRating
          reviewCount
          featured
          onSale
          description
          shortDescription(format: RAW)
          image {
            mediaItemUrl
            sourceUrl
            databaseId
          }
          type
          ... on SimpleProduct {
            id
            name
            stockStatus
            description
            galleryImages {
              edges {
                node {
                  mediaItemUrl
                  sourceUrl
                  databaseId
                }
              }
            }
            metaData(key: "tech_spec_data") {
              id
              key
              value
            }
            metaData(key: "warranty_period") {
              id
              key
              value
            }
            metaData(key: "warranty_type") {
              id
              key
              value
            }
            metaData(key: "inside_the_box") {
              id
              key
              value
            }
            brands {
              nodes {
                id
                name
                slug
              }
            }
            terms {
              nodes {
                ... on Brand {
                  id
                  name
                  slug
                }
              }
            }
            productCategories {
              nodes {
                name
                slug
              }
              edges {
                node {
                  name
                }
              }
            }
            price
            salePrice
            productTags {
              nodes {
                name
              }
            }
            databaseId
          }
          ... on VariableProduct {
            name
            description
            brands {
              nodes {
                id
                name
                slug
              }
            }
            metaData(key: "tech_spec_data") {
              id
              key
              value
            }
            metaData(key: "warranty_period") {
              id
              key
              value
            }
            metaData(key: "warranty_type") {
              id
              key
              value
            }
              metaData(key: "inside_the_box") {
              id
              key
              value
            }
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
            productCategories {
              nodes {
                name
                slug
              }
              edges {
                node {
                  name
                }
              }
            }
            galleryImages {
              edges {
                node {
                  mediaItemUrl
                  sourceUrl
                }
              }
            }
            price
            productTags {
              nodes {
                name
              }
            }
            id
            variations {
              edges {
                node {
                  id
                  image {
                    mediaItemUrl
                    sourceUrl
                    sizes
                    databaseId
                  }
                  name
                  price
                  salePrice
                }
              }
            }
            averageRating
            reviewCount
            databaseId
          }
        }
      }
    }
  }
`;
export const GET_BRAND_DETAILS = gql`
  query GetBrandDetails($slug: [String]) {
    brands(first: 100, where: { slug: $slug }) {
      nodes {
        databaseId
        name
        slug
        count
        id
      }
    }
  }
`;
export const GET_TECH_SPEC = gql`
  query techspec($productId: ID!) {
    product(id: $productId, idType: DATABASE_ID) {
      id
      name
      metaData(key: "tech_spec") {
        id
        key
        value
      }
    }
  }
`;

export const GET_NEW_ARRIVALS = gql`
  query GET_NEW_ARRIVALS {
    products(where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ...ProductContentCard
      }
    }
  }
  ${ProductContentCard}
`;

//productContentFull fragment is not working
export const GET_QUICK_VIEW_PRODUCT = gql`
  query quickview_product($productId: ID!) {
    product(id: $productId, idType: DATABASE_ID) {
      id
      databaseId
      slug
      name
      type
      description
      shortDescription(format: RAW)
      reviewCount
      metaData {
        id
        key
        value
      }
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
        metaData {
          id
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
        metaData {
          id
          key
          value
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
  }
  
`;


export const GET_ALL_PRODUCT_ATTRIBUTES = gql`
  query getAllProductAttributes {
    allProductAttributes {
      slug
      name
      terms {
        name
        slug
      }
    }
  }
`;