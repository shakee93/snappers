import { gql } from '@apollo/client';
import { ProductContentSlice } from './products.fragments';
import { CustomerAddressFragment } from './order.fragments';



export const CHECKOUT_MUTATION = gql`
  mutation Checkout($paymentMethod: String!) {
    checkout(input: { paymentMethod: $paymentMethod }) {
      clientMutationId
      order {
        id
        orderKey
        total
      }
    }
  }
`;

export const GUEST_CHECKOUT_MUTATION = gql`
mutation guestCheckout ($paymentMethod: String!, , $lineItems: [LineItemInput!]!) {
  createOrder(input: {
    paymentMethod: $paymentMethod,
    lineItems: $lineItems
  }) {
    clientMutationId
    order {
      orderKey
      total
    }
  }
}`

export const PAYMENT_DETAILS = gql`
query paymentDetails {
  customer(id: "") {
    availablePaymentMethods {
      gateway {
        id
        title
      }
    }
    availablePaymentMethodsCC {
      cardType
      expiryMonth
      expiryYear
      id
    }
  }
}
`

export const GET_ALL_ORDER_DETAILS = gql`
query MyQuery2 {
    orders {
      edges {
        node {
          orderNumber
          shipping {
            address1
          }
          date
          total
          subtotal
          lineItems {
            nodes {
              product {
                node {
                  ...ProductContentSlice
                }
              }
              total
            }
          }
          currency
          datePaid
          id
          pricesIncludeTax
          needsProcessing
          needsShippingAddress
          needsPayment
          status
        }
      }
    }
  }
  ${ProductContentSlice}


`;

export const GET_ADDRESSES = gql`
query getShippingDetails {
    customer {
      billing {
        ...CustomerAddressFragment
        }
      shipping {
        ...CustomerAddressFragment
        }
    }
}
${CustomerAddressFragment}

`; 