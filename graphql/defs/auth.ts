import { gql } from '@apollo/client';

export const RegisterCustomer = gql`

    mutation registerCustomer {
        registerCustomer(
            input: {
                email: "hello@gmail.com",
                username: "hello"
            }
        ) {
            authToken
            clientMutationId
            refreshToken
        }

    }

`;

