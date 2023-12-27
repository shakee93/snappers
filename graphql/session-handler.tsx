"use client";
import { GraphQLClient } from 'graphql-request';
import { GET_CART } from './defs/cart';

async function fetchSessionToken() {
    let sessionToken;
    try {
        const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_WP_GRAPHQL || "");

        const cartData: any = await graphQLClient.request(GET_CART);


        sessionToken = cartData?.cart?.sessionToken ?? "";

        if (!sessionToken) {
            throw new Error('Failed to retrieve a new session token');
        }
    } catch (err) {
        console.error(err);
    }

    return sessionToken;
}

export function saveCredentials(authToken: string, sessionToken: string, refreshToken = null) {
    if(authToken || sessionToken) {
        throw new Error('Invalid credentials');
    }
    sessionStorage.setItem(process.env.AUTH_TOKEN_SS_KEY || "", authToken);
    sessionStorage.setItem(process.env.SESSION_TOKEN_LS_KEY || "", sessionToken);
    if (refreshToken) {
      localStorage.setItem(process.env.REFRESH_TOKEN_LS_KEY || "", refreshToken);
    }
  }

export async function getSessionToken(forceFetch = false) {
    let sessionToken = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string);
    if (!sessionToken || forceFetch) {
        sessionToken = await fetchSessionToken();
    }
    return sessionToken;
}