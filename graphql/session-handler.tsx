"use client";
import { GraphQLClient } from 'graphql-request';
import { GET_CART } from './defs/cart';
import {SESSION_TOKEN_KEY} from "@/context/SessionProvider";

async function fetchSessionToken() {
    let sessionToken;
    try {
        const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_WP_GRAPHQL || "");

        const cartData: any = await graphQLClient.request(GET_CART);

        sessionToken = cartData?.customer?.sessionToken ?? "";
        if (!sessionToken) {
            throw new Error('Failed to retrieve a new session token');
        }
    } catch (err) {
        console.error(err);
    }

    return sessionToken;
}

export async function getSessionToken(forceFetch = false) {
    let sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!sessionToken || forceFetch) {
        sessionToken = await fetchSessionToken();
    }
    return sessionToken;
}