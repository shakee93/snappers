import { gql } from '@apollo/client';

export const REGISTER_CUSTOMER_MUTATION = gql`
mutation RegisterCustomer($input: RegisterCustomerInput!) {
    registerCustomer(input: $input) {
        authToken
        refreshToken
        customer {
        email
        firstName
        metaData {
            id
            key
            value
        }
        displayName
        }
    }
}
`;

export const LOGIN_CUSTOMER_MUTATION = gql`
mutation LoginCustomer($input: LoginInput!) {
    login(input: $input) {
        authToken
    clientMutationId
    refreshToken
    sessionToken
    customer {
      displayName
      date
      metaData {
        key
        value
      }
      email
      id
    }
    }
}
`;

