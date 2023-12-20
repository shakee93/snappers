'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import {GET_CART, GET_SESSION} from "@/graphql/defs/cart";

type Session = {
    sessionToken: string | null
}
const SessionContext = createContext<Session>({
    sessionToken: null
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
        <SessionContext.Provider value={{ sessionToken }}>
            {children}
        </SessionContext.Provider>
    );
}
