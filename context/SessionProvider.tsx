'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {FetchResult, useApolloClient, useMutation, useQuery} from '@apollo/client';
import {GET_CART} from "@/graphql/defs/cart";
import {REGISTER_CUSTOMER_MUTATION} from '@/graphql/defs/auth';
import {Session, SignUpResponse} from "@/utils/type";
import {UnregisterCallback} from "history";
import {RegisterCustomerInput, RegisterCustomerMutation} from "@/graphql/types/graphql";

const SessionContext = createContext<Session>({
    sessionToken: null,
    login: ()=> null
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

    const login = async (email: string, password: string)  => {
        let res: FetchResult<RegisterCustomerMutation>;
        return res = await registerCustomer({
            variables: {
                input: {
                    email,
                    password,
                },
            },
        });
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
