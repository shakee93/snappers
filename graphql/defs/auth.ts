import { gql } from '@apollo/client';

export const REGISTER_CUSTOMER_MUTATION = gql`
mutation RegisterCustomer($input: RegisterCustomerInput!) {
    registerCustomer(input: $input) {
        authToken
        refreshToken
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
    }
}
`;

