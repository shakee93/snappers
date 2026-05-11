'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ApolloError, FetchResult, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_CART } from "@/graphql/defs/cart";
import {
    GET_ACCOUNT_DETAILS,
    LOGIN_CUSTOMER_MUTATION,
    REGISTER_CUSTOMER_MUTATION,
    UPDATE_ACCOUNT_INFORMATION
} from '@/graphql/defs/auth';
import { LoginResponse, Session } from "@/utils/type";
import {
    Customer,
    LoginCustomerMutation,
    LoginPayload,
    RegisterCustomerMutation,
    RegisterCustomerPayload
} from "@/graphql/types/graphql";
import { useCart } from "@/context/CartProvider";
import {
    AUTH_TOKEN_KEY,
    AUTH_INVALIDATED_EVENT,
    REFRESH_TOKEN_KEY,
    SESSION_TOKEN_KEY,
    USER_DATA_KEY
} from "@/utils/storage-keys";

const SessionContext = createContext<Session>({
    sessionToken: null,
    signUp: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    login: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    logout: () => { },
    fetchCustomer: () => Promise.resolve(),
    customer: undefined,
    updateCustomer: undefined
});

export function useSession() {
    return useContext(SessionContext);
}

type AuthType = "registerCustomer" | "login";

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

    async function saveResponseToLocalStorage(response: any, type: AuthType = "registerCustomer") {

        const data: LoginPayload & RegisterCustomerPayload = response?.data?.[type]
        if (!data) return;

        const sessionTokenFromPayload = data?.sessionToken ?? data?.customer?.sessionToken ?? '';
        const normalizedSessionToken = sessionTokenFromPayload || null;

        // Prefer the existing guest session token if one is set: keeping it means
        // the next cart request carries `woocommerce-session: Session <guest>` +
        // the new `Authorization: Bearer <auth>` header, which is what triggers
        // WooCommerce to link the guest cart to the authenticated user. The
        // sessionAfterware then rotates SESSION_TOKEN_KEY to the user-owned
        // token via the woocommerce-session response header. Overwriting with
        // the login payload's sessionToken here orphans the guest cart.
        const existingGuestToken = localStorage.getItem(SESSION_TOKEN_KEY);
        const tokenToStore = existingGuestToken || normalizedSessionToken;

        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data?.customer));
        localStorage.setItem(AUTH_TOKEN_KEY, data?.authToken || '');
        if (tokenToStore) {
            localStorage.setItem(SESSION_TOKEN_KEY, tokenToStore);
        } else {
            localStorage.removeItem(SESSION_TOKEN_KEY);
        }
        localStorage.setItem(REFRESH_TOKEN_KEY, data?.refreshToken || '');

        setSessionToken(tokenToStore);
        setCustomer(data?.customer as Customer);

        await getCart();
    }

    const signUp = async (email: string, password: string) => {
        try {
            const response: FetchResult<RegisterCustomerMutation> = await registerCustomer({
                variables: {
                    input: {
                        email,
                        password,
                    },
                },
            });

            await saveResponseToLocalStorage(response);
            await fetchCustomer();

            return { data: "registered", error: null };
        } catch (error) {
            let errorMessage = "An error occurred while signing up.";
            if (error instanceof ApolloError) {
                if (error.message.includes("An account is already registered with your email address")) {
                    errorMessage = "An account with this email address already exists. Please log in.";
                } else {
                    console.error("Signup ApolloError:", error);
                    errorMessage = error.message || errorMessage;
                }
            } else {
                console.error("Signup error:", error);
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

            await saveResponseToLocalStorage(response, "login");
            await fetchCustomer();
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

        setSessionToken(null)
        setCustomer(null)
    };

    const fetchCustomer = async () => {
        const cached = localStorage.getItem(USER_DATA_KEY);
        const hasAuthToken = !!localStorage.getItem(AUTH_TOKEN_KEY);

        // Optimistic: paint cached state only when there is an auth token —
        // no token means the cache is definitionally stale, skip the flash.
        // Only set when customer is not already loaded to avoid redundant renders.
        if (cached && hasAuthToken && !customer) {
            try {
                const parsed = JSON.parse(cached) as unknown;
                if (parsed && typeof parsed === 'object' && 'id' in parsed) {
                    setCustomer(parsed as Customer);
                }
            } catch {
                // Corrupted cache — fall through to server validation.
            }
        }

        try {
            const { data } = await getUser();
            if (data?.customer && data.customer.id !== 'guest') {
                setCustomer(data.customer as Customer);
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.customer));
                return data;
            }
            // Server says guest — cached data is stale; clear it.
            setCustomer(null);
            localStorage.removeItem(USER_DATA_KEY);
            return null;
        } catch {
            console.warn('fetchCustomer: server validation failed — clearing customer state');
            setCustomer(null);
            return null;
        }
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
        const handleAuthInvalidated = () => {
            setCustomer(null);
            setSessionToken(null);
        };
        window.addEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);
        return () => window.removeEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);
    }, []);

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
