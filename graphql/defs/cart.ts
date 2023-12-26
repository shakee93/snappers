import { gql } from '@apollo/client';
import { CartContent, CartItemContent, CustomerContent } from "@/graphql/defs/cart.fragments";


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

export const GET_PAYMENT_GATEWAYS = gql`
query GetPayment {
    paymentGateways {
      nodes {
        description
        icon
        id
        title
      }
    }
  }
`