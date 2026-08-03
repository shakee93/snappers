'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApolloError, FetchResult, useLazyQuery, useMutation } from '@apollo/client';
import {
    GET_ACCOUNT_DETAILS,
    LOGIN_CUSTOMER_MUTATION,
    REGISTER_CUSTOMER_MUTATION,
    UPDATE_ACCOUNT_INFORMATION
} from '@/graphql/defs/auth';
import type { AuthSessionTokens } from '@/graphql/defs/auth-otp';
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
    applyAuthSession: async () => { },
    logout: () => { },
    fetchCustomer: () => Promise.resolve(),
    customer: undefined,
    updateCustomer: undefined
});

export function useSession() {
    return useContext(SessionContext);
}

type AuthType = "registerCustomer" | "login";

type PersistableTokens = {
    authToken: string | null | undefined;
    refreshToken: string | null | undefined;
    sessionToken?: string | null;
};

/**
 * Writes the auth/refresh tokens and resolves which WooCommerce session token
 * to keep, returning it.
 *
 * Prefer the existing guest session token if one is set: keeping it means the
 * next cart request carries `woocommerce-session: Session <guest>` + the new
 * `Authorization: Bearer <auth>` header, which is what triggers WooCommerce to
 * link the guest cart to the authenticated user. The sessionAfterware then
 * rotates SESSION_TOKEN_KEY to the user-owned token via the woocommerce-session
 * response header. Overwriting with the sign-in payload's sessionToken here
 * orphans the guest cart — as does clearing it, which is why the OTP flow (whose
 * payload carries no sessionToken at all) goes through this same path.
 */
function persistAuthTokens({ authToken, refreshToken, sessionToken }: PersistableTokens): string | null {
    const existingGuestToken = localStorage.getItem(SESSION_TOKEN_KEY);
    const tokenToStore = existingGuestToken || sessionToken || null;

    localStorage.setItem(AUTH_TOKEN_KEY, authToken || '');
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || '');
    if (tokenToStore) {
        localStorage.setItem(SESSION_TOKEN_KEY, tokenToStore);
    } else {
        localStorage.removeItem(SESSION_TOKEN_KEY);
    }

    return tokenToStore;
}

export function SessionProvider({ children }: {
    children: ReactNode
}) {
    const [sessionToken, setSessionToken] = useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem(SESSION_TOKEN_KEY) : null);

    const { getCart, customer, setCustomer } = useCart()

    const [getUser] = useLazyQuery(GET_ACCOUNT_DETAILS, {
        fetchPolicy: 'no-cache'
    })

    const [registerCustomer] = useMutation(REGISTER_CUSTOMER_MUTATION);
    const [loginCustomer] = useMutation(LOGIN_CUSTOMER_MUTATION);

    async function saveResponseToLocalStorage(response: any, type: AuthType = "registerCustomer") {

        const data: LoginPayload & RegisterCustomerPayload = response?.data?.[type]
        if (!data) return;

        const tokenToStore = persistAuthTokens({
            authToken: data?.authToken,
            refreshToken: data?.refreshToken,
            sessionToken: data?.sessionToken ?? data?.customer?.sessionToken,
        });

        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data?.customer));

        setSessionToken(tokenToStore);
        setCustomer(data?.customer as Customer);

        await getCart();
    }

    const fetchCustomer = useCallback(async () => {
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
    }, [customer, getUser, setCustomer]);

    const signUp = useCallback(async (email: string, password: string) => {
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
    }, [fetchCustomer, registerCustomer]);

    const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
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
    }, [fetchCustomer, loginCustomer]);

    /**
     * Completes a phone or provider sign-in. Those mutations return only
     * WordPress tokens, so the WooCommerce customer is resolved by re-reading
     * the cart and customer with the new Bearer token attached.
     */
    const applyAuthSession = useCallback(async (session: AuthSessionTokens) => {
        // No customer payload accompanies these sessions, so any cached user
        // belongs to a previous sign-in — drop it before fetchCustomer paints it.
        localStorage.removeItem(USER_DATA_KEY);

        const tokenToStore = persistAuthTokens({
            authToken: session.authToken,
            refreshToken: session.refreshToken,
        });
        setSessionToken(tokenToStore);

        await getCart();
        await fetchCustomer();
    }, [fetchCustomer, getCart]);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);

        setSessionToken(null)
        setCustomer(null)
    }, [setCustomer]);

    const [updateCustomerMutation] = useMutation(UPDATE_ACCOUNT_INFORMATION);

    const updateCustomer = useCallback(async (input: any) => {
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
    }, [updateCustomerMutation, setCustomer]);

    useEffect(() => {
        const handleAuthInvalidated = () => {
            setCustomer(null);
            setSessionToken(null);
        };
        window.addEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);
        return () => window.removeEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);
    }, []);

    const sessionValue = useMemo(
        () => ({
            sessionToken,
            signUp,
            login,
            applyAuthSession,
            logout,
            fetchCustomer,
            customer,
            updateCustomer,
        }),
        [sessionToken, signUp, login, applyAuthSession, logout, fetchCustomer, customer, updateCustomer],
    );

    return (
        <SessionContext.Provider value={sessionValue}>
            {children}
        </SessionContext.Provider>
    );
}
