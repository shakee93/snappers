import {FetchResult} from "@apollo/client";
import {RegisterCustomerMutation} from "@/graphql/types/graphql";

export type Session = {
    sessionToken: string | null,
    login: (email: string, password: string) => FetchResult<RegisterCustomerMutation> | null
}

export type SignUpResponse = {
    data: {
        registerCustomer: {
            authToken: string;
            refreshToken: string;
        };
    };
    __typename?: string;
};

