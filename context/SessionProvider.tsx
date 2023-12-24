'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {ApolloError, FetchResult, useApolloClient, useMutation, useQuery} from '@apollo/client';
import {GET_CART} from "@/graphql/defs/cart";
import {REGISTER_CUSTOMER_MUTATION} from '@/graphql/defs/auth';
import {Session, SignUpResponse} from "@/utils/type";
import {UnregisterCallback} from "history";
import {RegisterCustomerInput, RegisterCustomerMutation} from "@/graphql/types/graphql";

const SessionContext = createContext<Session>({
    sessionToken: null,
    login: async (email: string, password: string) => {
        return { data: null, error: null };
    }
});

export function useSession() {
    return useContext(SessionContext);
}

export function SessionProvider({ children }: {
    children: ReactNode
}) {
    const [sessionToken, setSessionToken] = useState<string | null>(typeof window !== "undefined" ? localStorage.getItem('sessionToken') : null);
    const client = useApolloClient();
    const { data, refetch } = useQuery(GET_CART, {
        skip: true
    })

    const [registerCustomer] = useMutation(REGISTER_CUSTOMER_MUTATION);

    const login = async (email: string, password: string) => {
        try {
            const response: FetchResult<RegisterCustomerMutation> = await registerCustomer({
                variables: {
                    input: {
                        email,
                        password,
                    },
                },
            });
            const authToken = response?.data?.registerCustomer?.authToken;
            const refreshToken = response?.data?.registerCustomer?.refreshToken;

            localStorage.setItem("authToken", authToken ?? "");
            localStorage.setItem("refreshToken", refreshToken ?? "");

            return { data: "registered", error: null };
        } catch (error) {
            let errorMessage = "An error occurred.";
            if (error instanceof ApolloError) {
                if (error.message.includes("An account is already registered with your email address")) {
                    errorMessage = "An account with this email address already exists. Please log in.";
                } else {
                    console.error("An ApolloError occurred:", error);
                }
            } else {
                console.error("An error occurred:", error);
            }
            return { data: null, error: errorMessage };
        }
    };



    useEffect(() => {
        // Fetch and store the session token when the component mounts
        async function fetchAndStoreSessionToken() {
            try {
                const { data } = await refetch()

                console.log(data);

                if (data && data?.customer?.sessionToken) {
                    const newSessionToken = data.customer.sessionToken;
                    setSessionToken(newSessionToken);
                    localStorage.setItem('sessionToken', newSessionToken);
                }
            } catch (error) {
                console.error('Error fetching session token:', error);
            }
        }

        if (!sessionToken) {
            fetchAndStoreSessionToken();
        }

    }, []);

    return (
        <SessionContext.Provider value={{ sessionToken, login }}>
            {children}
        </SessionContext.Provider>
    );
}
