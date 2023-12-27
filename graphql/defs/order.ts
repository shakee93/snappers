import { gql } from '@apollo/client';

export const GET_CUSTOMER_INFO = gql`
  query GetCusDetails{
    customer {
      addPaymentMethodUrl
    }
  }
`;


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

export const PAYMENT_DETAILS = gql`
query paymentDetails {
  customer(id: "") {
    type
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