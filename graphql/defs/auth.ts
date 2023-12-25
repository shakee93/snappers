import { gql } from '@apollo/client';
import { AccountDetailsFragment } from './auth.fragments';

export const REGISTER_CUSTOMER_MUTATION = gql`
    mutation RegisterCustomer($input: RegisterCustomerInput!) {
        registerCustomer(input: $input) {
            authToken
            refreshToken
            customer {
                email
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

// export const UPDATE_CUSTOMER_MUTATION = gql`
//     mutation UpdateCustomer($input: UpdateCustomerInput!) {
//         updateCustomer(input: $input) {
//             customer {
//                 email
//                 metaData {
//                     key
//                     value
//                 }
//                 id
//             }
//         }
//     }       
// `;

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
        customer {
            email
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

