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

export const UpdateCustomer = gql`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        ...CustomerFields
      }
    }
  }
  ${CustomerFields}
`;


export const UPDATE_ACCOUNT_INFORMATION = gql`
    mutation updateAccountDetails($input: UpdateCustomerInput!) {
        updateCustomer(input: $input) {
            customer {
            email
            metaData {
                key
                value
                }
            id
            }
        }
    }
`;


// export const GET_ACCOUNT_DETAILS = gql`
//     query getAccountDetails($input: UpdateCustomerInput!) {
//         customer(id: $input) {
//             email
//             displayName
//             billing {
//                 address1
//                 phone
//                 email
//             }
//             metaData(multiple: true) {
//                 key
//                 value
//                 id
//             }
//             username
//             id
//         }
//     }
// `;


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

