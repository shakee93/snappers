import { gql } from '@apollo/client';
import { AccountDetailsFragment } from './auth.fragments';

export const REGISTER_CUSTOMER_MUTATION = gql`
    mutation RegisterCustomer($input: RegisterCustomerInput!) {
        registerCustomer(input: $input) {
            authToken
            refreshToken
            customer {
                email
                jwtAuthToken
                firstName
                metaData {
                    key
                    value
                }
                sessionToken
                displayName
            }
        }
    }
`;



export const GET_AUTH_TOKEN = gql`
  mutation RefreshAuthToken($refreshToken: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
`;

export const CustomerFields = gql`
  fragment CustomerFields on Customer {
    id
    databaseId
    firstName
    lastName
    displayName
    # billing {
    #   ...AddressFields
    # }
    # shipping {
    #   ...AddressFields
    # }
    # orders(first: 100) {
    #   nodes {
    #     ...OrderFields
    #   } 
    # }
  }
`;

export const Login = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      customer {
        ...CustomerFields
      }
    }
  }
  ${CustomerFields}
`;



// metalist__
// gender
// about
// date
export const UPDATE_ACCOUNT_INFORMATION = gql`
    mutation updateCustomer {
  updateCustomer(input: {firstName: "asdfasfdsdaf", id: "Y3VzdG9tZXI6Mjk="}) {
      authToken
      clientMutationId
      refreshToken
      customer {
          metaData {
              key
              value
          }
          displayName
      }
      
  }
}

`;

// metalist__
// gender
// about
// date
export const GET_ACCOUNT_DETAILS = gql`
   query getAccountDetails {
      customer {
        displayName
        email
        metaData{
          key
          value
        }
        shipping {
          address1
          phone
        }
  }
}
`;


export const LOGIN_CUSTOMER_MUTATION = gql`
mutation LoginCustomer($input: LoginInput!) {
    login(input: $input) {
        authToken
        refreshToken
        sessionToken
        customer {
            email
            jwtAuthToken
            firstName
            metaData {
                key
                value
            }
            id
            displayName
        }
    }
}
`;

