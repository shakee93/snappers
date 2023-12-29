import { gql } from '@apollo/client';



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