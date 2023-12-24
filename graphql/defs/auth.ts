import {gql} from '@apollo/client';

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

export const UPDATE_CUSTOMER_MUTATION = gql`
    mutation UpdateCustomer($input: UpdateCustomerInput!) {
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



export const LOGIN_CUSTOMER_MUTATION = gql`
mutation LoginCustomer($input: LoginInput!) {
    login(input: $input) {
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

