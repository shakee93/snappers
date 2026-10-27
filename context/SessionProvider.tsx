'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApolloError, useLazyQuery, useMutation } from '@apollo/client';
import {
    GET_ACCOUNT_DETAILS,
    UPDATE_ACCOUNT_INFORMATION
} from '@/graphql/defs/auth';
import type { AuthSessionTokens } from '@/graphql/defs/auth-otp';
import { Session } from "@/utils/type";
import { Customer, GetAccountDetailsQuery } from "@/graphql/types/graphql";
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
    applyAuthSession: async () => { },
    logout: () => { },
    fetchCustomer: () => Promise.resolve(null as GetAccountDetailsQuery | null),
    customer: undefined,
    updateCustomer: undefined
});

export function useSession() {
    return useContext(SessionContext);
}

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
 * orphans the guest cart - as does clearing it, which is why the OTP flow (whose
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

    const fetchCustomer = useCallback(async () => {
        const cached = localStorage.getItem(USER_DATA_KEY);
        const hasAuthToken = !!localStorage.getItem(AUTH_TOKEN_KEY);

        // Optimistic: paint cached state only when there is an auth token -
        // no token means the cache is definitionally stale, skip the flash.
        // Only set when customer is not already loaded to avoid redundant renders.
        if (cached && hasAuthToken && !customer) {
            try {
                const parsed = JSON.parse(cached) as unknown;
                if (parsed && typeof parsed === 'object' && 'id' in parsed) {
                    setCustomer(parsed as Customer);
                }
            } catch {
                // Corrupted cache - fall through to server validation.
            }
        }

        try {
            const { data } = await getUser();
            if (data?.customer && data.customer.id !== 'guest') {
                setCustomer(data.customer as Customer);
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.customer));
                return data;
            }
            // Server says guest - cached data is stale; clear it.
            setCustomer(null);
            localStorage.removeItem(USER_DATA_KEY);
            return null;
        } catch {
            console.warn('fetchCustomer: server validation failed - clearing customer state');
            setCustomer(null);
            return null;
        }
    }, [customer, getUser, setCustomer]);

    /**
     * Completes a phone or provider sign-in. Those mutations return only
     * WordPress tokens, so the WooCommerce customer is resolved by re-reading
     * the cart and customer with the new Bearer token attached.
     */
    const applyAuthSession = useCallback(async (session: AuthSessionTokens) => {
        // No customer payload accompanies these sessions, so any cached user
        // belongs to a previous sign-in - drop it before fetchCustomer paints it.
        localStorage.removeItem(USER_DATA_KEY);

        const tokenToStore = persistAuthTokens({
            authToken: session.authToken,
            refreshToken: session.refreshToken,
        });
        setSessionToken(tokenToStore);

        // Sequential on purpose: getCart is what carries the guest
        // woocommerce-session + new Bearer together and rotates the session
        // token via sessionAfterware before fetchCustomer reads the account.
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
            const message =
                error instanceof ApolloError && error.message
                    ? error.message
                    : "An error occurred while updating customer.";
            return { data: null, error: message };
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
            applyAuthSession,
            logout,
            fetchCustomer,
            customer,
            updateCustomer,
        }),
        [sessionToken, applyAuthSession, logout, fetchCustomer, customer, updateCustomer],
    );

    return (
        <SessionContext.Provider value={sessionValue}>
            {children}
        </SessionContext.Provider>
    );
}
