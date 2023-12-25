'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ApolloError, FetchResult, useMutation, useQuery } from '@apollo/client';
import { GET_CART } from "@/graphql/defs/cart";
import { LOGIN_CUSTOMER_MUTATION, REGISTER_CUSTOMER_MUTATION } from '@/graphql/defs/auth';
import { LoginResponse, Session } from "@/utils/type";
import { LoginCustomerMutation, RegisterCustomerMutation } from "@/graphql/types/graphql";

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

function saveResponseToLocalStorage(response: any, type = "registerCustomer") {
    const authToken = response?.data?.[type]?.authToken;
    const refreshToken = response?.data?.[type]?.refreshToken;
    const email = response?.data?.[type]?.customer?.email;
    const displayName = response?.data?.[type]?.customer?.displayName;
    const firstName = response?.data?.[type]?.customer?.firstName;
    const address = response?.data?.[type]?.customer?.metaData?.[0]?.value;
    const dob = response?.data?.[type]?.customer?.metaData?.[1]?.value;
    const gender = response?.data?.[type]?.customer?.metaData?.[2]?.value;
    const phone_number = response?.data?.[type]?.customer?.metaData?.[3]?.value;
    const about = response?.data?.[type]?.customer?.metaData?.[4]?.value;
    const id = response?.data?.[type]?.customer?.id;
    let session = response?.data?.[type]?.sessionToken || response?.data?.[type]?.customer?.jwtAuthToken
   
    localStorage.setItem("sesToken", session || "");
    localStorage.setItem("authToken", session || "");
    
    localStorage.setItem("refreshToken", refreshToken || "");
    localStorage.setItem("email", email || "");
    localStorage.setItem("displayName", displayName || "");
    localStorage.setItem("firstName", firstName || "");
    localStorage.setItem("address", address || "");
    localStorage.setItem("dob", dob || "");
    localStorage.setItem("gender", gender || "");
    localStorage.setItem("phone_number", phone_number || "");
    localStorage.setItem("about", about || "");
    localStorage.setItem("id", id || "");

    console.log("Updated Response: ", response);
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
            const username = email;
            const response: FetchResult<LoginCustomerMutation> = await loginCustomer({
                variables: {
                    input: {
                        username,
                        password,
                    },
                },
            });

            const authToken = response?.data?.login?.authToken;
            const refreshToken = response?.data?.login?.refreshToken;

            saveResponseToLocalStorage(response, "login");

            localStorage.setItem("authToken", authToken ?? "");
            localStorage.setItem("refreshToken", refreshToken ?? "");

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
        // localStorage.removeItem("sessionToken");
        localStorage.removeItem("refreshToken");
        setSessionToken(null);
    };

    useEffect(() => {
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
        <SessionContext.Provider value={{ sessionToken, signUp, login, logout }}>
            {children}
        </SessionContext.Provider>
    );
}
