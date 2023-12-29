'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {ApolloError, FetchResult, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import { GET_CART } from "@/graphql/defs/cart";
import {GET_ACCOUNT_DETAILS, LOGIN_CUSTOMER_MUTATION, REGISTER_CUSTOMER_MUTATION} from '@/graphql/defs/auth';
import { LoginResponse, Session } from "@/utils/type";
import {
    Customer,
    LoginCustomerMutation,
    LoginPayload, Maybe,
    RegisterCustomerMutation,
    RegisterCustomerPayload
} from "@/graphql/types/graphql";

const SessionContext = createContext<Session>({
    sessionToken: null,
    signUp: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    login: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    logout: () => { },
    fetchCustomer: () => {},
    customer: undefined
});

export function useSession() {
    return useContext(SessionContext);
}

type AuthType = "registerCustomer" | "login";

export const REFRESH_TOKEN_KEY = 'wp_refresh_token';
export const SESSION_TOKEN_KEY = 'wp_session_token';
export const AUTH_TOKEN_KEY = 'wp_auth_token';

export const USER_DATA_KEY = 'wp_user'




export function SessionProvider({ children }: {
    children: ReactNode
}) {
    const [sessionToken, setSessionToken] = useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem(SESSION_TOKEN_KEY) : null);

    const [customer, setCustomer] = useState<Customer>()

    const { data, refetch } = useQuery(GET_CART, {
        skip: true
    })
    const [getUser] = useLazyQuery(GET_ACCOUNT_DETAILS, {
        fetchPolicy: 'no-cache'
    })

    const [registerCustomer] = useMutation(REGISTER_CUSTOMER_MUTATION);
    const [loginCustomer] = useMutation(LOGIN_CUSTOMER_MUTATION);

    function saveResponseToLocalStorage(response: any, type: AuthType = "registerCustomer") {

        const data : LoginPayload & RegisterCustomerPayload = response?.data?.[type]

        if (type === "login") {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.customer));
            setCustomer(data.customer as Customer)

            localStorage.setItem(AUTH_TOKEN_KEY, data.authToken || '');
            localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken || '');
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken || '');
        }

    }

    const signUp = async (email: string, password: string) => {
        try {
            const response: FetchResult<RegisterCustomerMutation> = await registerCustomer({
                variables: {
                    input: {
                        email,
                        password,
                        displayName: "a",
                        firstName: "",
                        metaData: [
                            { key: "address", value: "" },
                            { key: "dob", value: "" },
                            { key: "gender", value: "" },
                            { key: "phone_number", value: "" },
                            { key: "about", value: "" }
                        ]
                    },
                },
            });

            saveResponseToLocalStorage(response);

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

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response: FetchResult<LoginCustomerMutation> = await loginCustomer({
                variables: {
                    input: {
                        username: email,
                        password,
                    },
                },
            })

            saveResponseToLocalStorage(response, "login");

            return { data: "logged_in", error: null };
        } catch (error) {
            let errorMessage = "An error occurred during login.";
            if (error instanceof ApolloError) {
                if (error.message.includes("No user found with this email address")) {
                    errorMessage = "No user found with this email address. Please check your credentials.";
                } else if (error.message.includes("Incorrect password")) {
                    errorMessage = "Incorrect password. Please try again.";
                } else {
                    console.error("An ApolloError occurred:", error);
                }
            } else {
                console.error("An error occurred:", error);
            }
            return { data: null, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);

        setCustomer(undefined)
        // setSessionToken(null);
    };


    const fetchCustomer = async () => {

        const userData = localStorage.getItem(USER_DATA_KEY);

        if (userData) {
            setCustomer(JSON.parse(userData) as unknown as Customer)
            return userData
        }

        const { data } = await getUser();
        setCustomer(data.customer as Customer)
        return data
    }

    useEffect(() => {
        async function fetchAndStoreSessionToken() {
            try {
                const { data } = await refetch()

                if (data && data?.customer?.sessionToken) {
                    const newSessionToken = data.customer.sessionToken;
                    setSessionToken(newSessionToken)
                    localStorage.setItem(SESSION_TOKEN_KEY, newSessionToken);
                }
            } catch (error) {
                console.error('Error fetching session token:', error);
            }
        }

        if (!sessionToken && !localStorage.getItem(REFRESH_TOKEN_KEY)) {
            fetchAndStoreSessionToken();
        }

    }, []);

    return (
        <SessionContext.Provider value={{ sessionToken, signUp, login, logout, fetchCustomer, customer }}>
            {children}
        </SessionContext.Provider>
    );
}
