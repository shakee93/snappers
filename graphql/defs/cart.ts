import { gql } from '@apollo/client';


export const ProductContentSlice = gql`
    fragment ProductContentSlice on Product {
        id
        databaseId
        name
        slug
        type
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



export const CustomerContent = gql`
    fragment CustomerContent on Customer {
        id
        sessionToken
    }
`;

export const CartItemContent = gql`
    fragment CartItemContent on CartItem {
        key
        product {
            node {
                ...ProductContentSlice
            }
        }
        variation {
            node {
                ...ProductVariationContentSlice
            }
        }
        quantity
        total
        subtotal
        subtotalTax
        extraData {
            key
            value
        }
    }
    ${ProductContentSlice}
    ${ProductVariationContentSlice}
`;

// Add a product to the cart

export const CartContent = gql`
  fragment CartContent on Cart {
      
    contents(first: 100) {
      itemCount
      nodes {
        ...CartItemContent
      }
    }
    appliedCoupons {
      code
      discountAmount
      discountTax
    }
    needsShippingAddress
    availableShippingMethods {
      packageDetails
      supportsShippingCalculator
      rates {
        id
        instanceId
        methodId
        label
        cost
      }
    }
    subtotal
    subtotalTax
    shippingTax
    shippingTotal
    total
    totalTax
    feeTax
    feeTotal
    discountTax
    discountTotal
  }
  ${CartItemContent}
`;


export const ADD_TO_CART = gql`
    mutation AddToCart($productId: Int!, $variationId: Int, $quantity: Int, $extraData: String) {
        addToCart(
            input: {productId: $productId, variationId: $variationId, quantity: $quantity, extraData: $extraData}
        ) {
            cart {
                ...CartContent
            }
            cartItem {
                ...CartItemContent
            }
           
        }
    }
    ${CartContent}
    ${CartItemContent}
`;

export const GET_SESSION = gql`
    query {
        customer {
            sessionToken
        }
    }
`;

export const GET_CART = gql`
    query GetCart($customerId: Int) {
        cart {
            ...CartContent
        }
        customer(customerId: $customerId) {
            ...CustomerContent
        }
    }
    ${CartContent}
    ${CustomerContent}
`;


export const UPDATE_CART_ITEM_QUANTITY = gql`
    mutation UpdateCartItemQuantities($items: [CartItemQuantityInput]) {
        updateItemQuantities(input: {items: $items}) {
            cart {
                ...CartContent
            }
            items {
                ...CartItemContent
            }
        }
    }
    ${CartContent}
    ${CartItemContent}
`;

export const REMOVE_ITEMS_FROM_CART = gql`
    mutation RemoveItemsFromCart($keys: [ID], $all: Boolean) {
        removeItemsFromCart(input: {keys: $keys, all: $all}) {
            cart {
                ...CartContent
            }
            cartItems {
                ...CartItemContent
            }
        }
    }
    ${CartContent}
    ${CartItemContent}
`;