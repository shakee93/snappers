'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ApolloError, FetchResult, useMutation, useQuery } from '@apollo/client';
import { GET_CART } from "@/graphql/defs/cart";
import { LOGIN_CUSTOMER_MUTATION, REGISTER_CUSTOMER_MUTATION } from '@/graphql/defs/auth';
import { LoginResponse, Session } from "@/utils/type";
import { LoginCustomerMutation, RegisterCustomerMutation } from "@/graphql/types/graphql";
import { saveCredentials } from '@/graphql/session-handler';

const SessionContext = createContext<Session>({
    sessionToken: null,
    signUp: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    login: async (email: string, password: string) => {
        return { data: null, error: null };
    },
    logout: () => { }
});

export function useSession() {
    return useContext(SessionContext);
}

type AuthType = "registerCustomer" | "login";

export const REFRESH_TOKEN_KEY = 'wp_refresh_token';
export const SESSION_TOKEN_KEY = 'wp_session_token';
export const AUTH_TOKEN_KEY = 'wp_auth_token';

export const USER_DATA_KEY = 'wp_user'

function saveResponseToLocalStorage(response: any, type: AuthType = "registerCustomer") {

    const data = response?.data?.[type]


    console.log(data);

    return
    // save User details
    let authToken, refreshToken, sessionToken;

    if (type === "login") {
        sessionToken = response.data?.login?.sessionToken;
        authToken = response?.data?.login?.authToken;
        refreshToken = response?.data?.login?.refreshToken;

    } else if (type === "registerCustomer") {
        sessionToken = response.data?.login?.customer.sessionToken;
        authToken = response?.data?.registerCustomer?.user?.jwtAuthToken;
        refreshToken = response?.data?.registerCustomer?.user?.jwtRefreshToken;
    }

    console.log("sessionToken on the login:", sessionToken);
    console.log("refreshToken on the login:", refreshToken);
    console.log("authToken on the login:", authToken);

    if(sessionToken) {
        localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY || "", sessionToken);
    }
    if (authToken) {
        localStorage.setItem(process.env.AUTH_TOKEN_SS_KEY || "", authToken);
    }
    if (refreshToken) {
        localStorage.setItem(process.env.REFRESH_TOKEN_LS_KEY || "", refreshToken);
    }

    saveCredentials(authToken, sessionToken, refreshToken);

}


export function SessionProvider({ children }: {
    children: ReactNode
}) {
    const [sessionToken, setSessionToken] = useState<string | null>(typeof window !== "undefined" ? localStorage.getItem('sessionToken') : null);
    const { data, refetch } = useQuery(GET_CART, {
        skip: true
    })

    const [registerCustomer] = useMutation(REGISTER_CUSTOMER_MUTATION);
    const [loginCustomer] = useMutation(LOGIN_CUSTOMER_MUTATION);

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
        localStorage.removeItem("authToken");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem(process.env.AUTH_TOKEN_SS_KEY || "");
        localStorage.removeItem(process.env.REFRESH_TOKEN_LS_KEY || "");
        localStorage.removeItem(process.env.SESSION_TOKEN_LS_KEY || "");

        setSessionToken(null);
    };

    useEffect(() => {
        async function fetchAndStoreSessionToken() {
            try {
                const { data } = await refetch()

                if (data && data?.customer?.sessionToken) {
                    const newSessionToken = data.customer.sessionToken;
                    setSessionToken(newSessionToken);
                    localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY || "", newSessionToken);
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
        <SessionContext.Provider value={{ sessionToken, signUp, login, logout }}>
            {children}
        </SessionContext.Provider>
    );
}
