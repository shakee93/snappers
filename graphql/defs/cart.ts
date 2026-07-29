import { gql } from '@apollo/client';
import {
  CartContent,
  CartContentSlim,
  CartContentWithRates,
  CartItemContent,
} from "@/graphql/defs/cart.fragments";
import {CustomerFragment} from "@/graphql/defs/auth.fragments";


export const ADD_TO_CART = gql`
    mutation AddToCart($productId: Int!, $variationId: Int, $quantity: Int, $extraData: String) {
        addToCart(
            input: {productId: $productId, variationId: $variationId, quantity: $quantity, extraData: $extraData}
        ) {
            cart {
                ...CartContentSlim
            }
            cartItem {
                ...CartItemContent
            }
        }
    }
    ${CartContentSlim}
    ${CartItemContent}
`;

export const GET_CART = gql`
    query GetCart($customerId: Int, $recalculateTotals: Boolean) {
        cart(recalculateTotals: $recalculateTotals) {
            ...CartContentWithRates
        }
        customer(customerId: $customerId) {
            ...CustomerFragment
        }
    }
    ${CartContentWithRates}
    ${CustomerFragment}
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
`;

export const UPDATE_SHIPPING_TOTAL = gql`
mutation updateShippingMethod($input: UpdateShippingMethodInput!){  
    updateShippingMethod(input: $input){    
        cart {
                  ...CartContentWithRates    
                }
                clientMutationId  
            }
        }
        ${CartContentWithRates}`


export const APPLY_COUPON = gql`
mutation ApplyCoupon($code: String!) {
  applyCoupon(input: { code: $code }) {
    applied {
      code
      discountAmount
      discountTax
      description
    }
    cart {
      ...CartContent
    }
  }
}
${CartContent}`

export const REMOVE_COUPONS = gql`
mutation RemoveCoupons($codes: [String]) {
  removeCoupons(input: { codes: $codes }) {
    cart {
      ...CartContent
    }
  }
}
${CartContent}`

