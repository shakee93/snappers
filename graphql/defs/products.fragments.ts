import { gql } from '@apollo/client';

export const ProductContentSlice = gql`
    fragment ProductContentSlice on Product {
        id
        databaseId
        name
        slug
        type
        terms {
            nodes {
                ... on Brand {
                    id
                    name
                    slug
                }
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
        }
        ... on VariableProduct {
            price
            regularPrice
            soldIndividually
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
        image {
            id
            sourceUrl
            altText
        }
        galleryImages {
            nodes {
                id
                sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
                altText
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
                ... on LocalProductAttribute {
                    name
                    options
                    variation
                }
                ... on GlobalProductAttribute {
                    name
                    options
                    variation
                }
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
        ... on SimpleProduct {
            onSale
            stockStatus
            price
            rawPrice: price(format: RAW)
            regularPrice
            salePrice
            stockStatus
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
        }
        ... on VariableProduct {
            onSale
            price
            rawPrice: price(format: RAW)
            regularPrice
            salePrice
            stockStatus
            stockQuantity
            soldIndividually
            productCategories {
                nodes {
                    id
                    name
                    slug
                }
            }
            variations(first: 50) {
                nodes {
                    id
                    databaseId
                    name
                    price
                    rawPrice: price(format: RAW)
                    regularPrice
                    salePrice
                    onSale
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