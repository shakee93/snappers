import {gql} from '@apollo/client';


export const GET_PRODUCT_SLUGS = gql`
    query productSlugs {
        products {
            nodes {
                slug
            }
        }
    }
`;


export const GET_PRODUCT = gql`
    query GetProduct($productId: ID!, $categoryId: ID!) {
        product(id: $productId, idType: SLUG) {
            name
            slug
            databaseId
            image {
                link
            }
        }
        productCategory(id: $categoryId, idType: SLUG) {
            slug
            databaseId
        }
    }
`;

export const GET_ALL_PRODUCTS = gql`
    query GetAllProducts($categoryIdIn: [Int]) {
        products(first: 12,  where: {categoryIdIn: $categoryIdIn}) {
            edges {
                node {
                    name
                    slug
                    image {
                        mediaItemUrl
                    }
                    type
                    ... on SimpleProduct {
                        id
                        name
                        productCategories {
                            nodes {
                                name
                            }
                        }
                        price
                        productTags {
                            nodes {
                                name
                            }
                        }
                    }

                }
            }
        }
        productCategories(first: 100) {
            nodes {
                name
                slug
                id
                databaseId
            }
        }
    }
`

export const GET_ALL_PRODUCTS_FILTER_CATEGORIES = gql`
    query GetAllProducts($categoryIdIn: [Int]) {
        products(first: 30,  where: {categoryIdIn: $categoryIdIn}) {
            edges {
                node {
                    name
                    slug
                    image {
                        mediaItemUrl
                    }
                    type
                    ... on SimpleProduct {
                        id
                        name
                        productCategories {
                            nodes {
                                name
                            }
                        }
                        price
                        productTags {
                            nodes {
                                name
                            }
                        }
                    }

                }
            }
        }
        productCategories(first: 100) {
            nodes {
                name
                slug
            }
        }
    }
`


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

export const GET_CATEGORY = gql`
    query GetProductCategory($categoryId: ID!) {
        productCategory(id: $categoryId, idType: SLUG) {
            description
            name
            slug
            databaseId
            image {
                link
            }
        }
    }
`;