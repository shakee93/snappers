import {gql} from "@apollo/client";

export const GET_AUTH_TOKEN = gql`
  mutation RefreshAuthToken($refreshToken: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
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
        id
        displayName
        firstName
        email
        billing {
          phone
        }
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
