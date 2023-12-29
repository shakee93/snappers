import { gql } from '@apollo/client';

// export const GET_CUSTOMER_INFO = gql`
//   query GetCusDetails{
//     customer {
//       addPaymentMethodUrl
//     }
//   }
// `;


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