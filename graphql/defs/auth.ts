import {gql} from "@apollo/client";

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
  mutation updateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      clientMutationId
      customer {
        displayName
        email
        shipping {
          address1
          phone
        }
        metaData {
          key
          value
        }
      }
    }
  }
`;

// Rename one of these operations to have a unique name
export const GET_ACCOUNT_DETAILS = gql`
  query getAccountDetails {
    customer {
      id
      displayName
      email
      metaData {
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
        orders {
          nodes {
           id 
          }
        }
        displayName
      }
    }
  }
`;

export const SEND_PASSWORD_RESET_EMAIL = gql`
  mutation SendPasswordResetEmail($username: String!) {
    sendPasswordResetEmail(input: { username: $username }) {
      success
    }
  }
`;

export const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($key: String!, $login: String!, $password: String!) {
    resetUserPassword(input: { key: $key, login: $login, password: $password }) {
      user {
        id
      }
    }
  }
`;
