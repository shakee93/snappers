import {FetchResult} from "@apollo/client";
import {RegisterCustomerMutation} from "@/graphql/types/graphql";

export type Session = {
    sessionToken: string | null,
    login: (email: string, password: string) => Promise<SignUpResponse>
}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}


