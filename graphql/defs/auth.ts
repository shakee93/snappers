import { gql } from '@apollo/client';

export const REGISTER_CUSTOMER_MUTATION = gql`
mutation RegisterCustomer($input: RegisterCustomerInput!) {
    registerCustomer(input: $input) {
        authToken
        refreshToken
    }
}
`;
