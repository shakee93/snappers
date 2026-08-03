import {Customer, Maybe} from "@/graphql/types/graphql";
import type {AuthSessionTokens} from "@/graphql/defs/auth-otp";

export type Session = {
    sessionToken: string | null,
    signUp:  any,
    // login: (email: string, password: string) => Promise<LoginResponse>,
    login:any, 
    applyAuthSession: (session: AuthSessionTokens) => Promise<void>,
    logout:  any,
    fetchCustomer: () => Promise<any>
    customer: Maybe<Customer | undefined>
    updateCustomer: any

}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}

export type LoginResponse = {
    data: string | null;
    error: string | null;
}



