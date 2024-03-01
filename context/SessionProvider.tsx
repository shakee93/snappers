'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {ApolloError, FetchResult, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import {GET_CART} from "@/graphql/defs/cart";
import {
    GET_ACCOUNT_DETAILS,
    LOGIN_CUSTOMER_MUTATION,
    REGISTER_CUSTOMER_MUTATION,
    UPDATE_ACCOUNT_INFORMATION
} from '@/graphql/defs/auth';
import {LoginResponse, Session} from "@/utils/type";
import {
    Customer,
    LoginCustomerMutation,
    LoginPayload,
    RegisterCustomerMutation,
    RegisterCustomerPayload
} from "@/graphql/types/graphql";
import {useCart} from "@/context/CartProvider";

const SessionContext = createContext<Session>({
    sessionToken: null,
    signUp: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    login: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    logout: () => { },
    fetchCustomer: () => { },
    customer: undefined,
    updateCustomer: undefined
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

    const { getCart, customer, setCustomer } = useCart()

    const { data, refetch } = useQuery(GET_CART, {
        skip: true
    })

    const [getUser] = useLazyQuery(GET_ACCOUNT_DETAILS, {
        fetchPolicy: 'no-cache'
    })

    const [registerCustomer] = useMutation(REGISTER_CUSTOMER_MUTATION);
    const [loginCustomer] = useMutation(LOGIN_CUSTOMER_MUTATION);

    function saveResponseToLocalStorage(response: any, type: AuthType = "registerCustomer") {

        const data: LoginPayload & RegisterCustomerPayload = response?.data?.[type]

        if (type === "login") {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(data?.customer));
            // console.log("setting customer: ", data?.customer)
            setCustomer(data?.customer as Customer)

            localStorage.setItem(AUTH_TOKEN_KEY, data?.authToken || '');
            localStorage.setItem(SESSION_TOKEN_KEY, data?.sessionToken || '');
            localStorage.setItem(REFRESH_TOKEN_KEY, data?.refreshToken || '');
        }

        if (type == "registerCustomer"){
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(data?.customer));
            setCustomer(data?.customer as Customer)

            localStorage.setItem(AUTH_TOKEN_KEY, data?.authToken || '');
            localStorage.setItem(SESSION_TOKEN_KEY, data?.customer?.sessionToken || '');
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken || '');
        }

        getCart()
        fetchCustomer()
    }

    const signUp = async (email: string, password: string) => {
        logout()
        try {
            const response: FetchResult<RegisterCustomerMutation> = await registerCustomer({
                variables: {
                    input: {
                        email,
                        password,
                    },
                },
            });

            console.log("Sign up",response);

            saveResponseToLocalStorage(response);

            return { data: "registered", error: null };
        } catch (error) {
            let errorMessage = "An error occurred.";
            if (error instanceof ApolloError) {
                if (error.message.includes("An account is already registered with your email address")) {
                    errorMessage = "An account with this email address already exists. Please log in.";
                } else {
                    throw "An error occurred while Signup";
                    // console.log("An ApolloError occurred:", error);
                }
            } else {
                console.log("An error occurred:", error);
            }
            return { data: null, error: errorMessage };
        }
    };

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        await logout()
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
            fetchCustomer();
            return { data: "logged_in", error: null };
        } catch (error) {
            let errorMessage = "An error occurred while login.";
            if (error instanceof ApolloError) {
                if (error.message.includes("invalid_email")) {
                    errorMessage = "No user found with this email address.";
                } else if (error.message.includes("incorrect_password")) {
                    errorMessage = "Incorrect password.";
                } else {
                    console.error("An ApolloError occurred:", error);
                }
            } else {
                errorMessage = typeof error === "string" ? error : "";
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

        setCustomer(null)
        getCart()
    };

    const fetchCustomer = async () => {

        const userData = localStorage.getItem(USER_DATA_KEY);
        // console.log("userData", JSON.parse(userData!));
        if (userData) {
            // console.log(JSON.parse(userData));
            setCustomer(JSON.parse(userData) as unknown as Customer)
            return userData
        }

        const { data } = await getUser();
        setCustomer(data.customer as Customer)
        // saveResponseToLocalStorage(data.customer, "login");
        return data
    }

    const [updateCustomerMutation] = useMutation(UPDATE_ACCOUNT_INFORMATION);

    const updateCustomer = async (input: any) => {
        try {
            const response = await updateCustomerMutation({
                variables: { input },
            });
            const data: any = response?.data?.updateCustomer;

            // Update the customer data in the session and local storage
            if (data?.customer) {
                setCustomer(data.customer as Customer);
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.customer));
            }

            return { data: "updated", error: null };
        } catch (error) {
            console.error("An error occurred while updating customer:", error);
            return { data: null, error: "An error occurred while updating customer." };
        }
    };

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
        <SessionContext.Provider value={{ sessionToken, signUp, login, logout, fetchCustomer, customer, updateCustomer }}>
            {children}
        </SessionContext.Provider>
    );
}
