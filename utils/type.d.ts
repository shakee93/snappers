import {Customer, GetAccountDetailsQuery, Maybe} from "@/graphql/types/graphql";
import type {AuthSessionTokens} from "@/graphql/defs/auth-otp";

export type Session = {
    sessionToken: string | null,
    applyAuthSession: (session: AuthSessionTokens) => Promise<void>,
    logout: () => void,
    fetchCustomer: () => Promise<GetAccountDetailsQuery | null>,
    customer: Maybe<Customer | undefined>,
    updateCustomer: any,
}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}

export type LoginResponse = {
    data: string | null;
    error: string | null;
}



