import { gql } from '@apollo/client';
import {ProductContentSlice, ProductVariationContentSlice} from "@/graphql/defs/products.fragments";

export const CartItemContent = gql`
    fragment CartItemContent on CartItem {
        key
        product {
            node {
                ...ProductContentSlice
            }
        }
        variation {
            attributes {
                label
                name
                value
            }
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

