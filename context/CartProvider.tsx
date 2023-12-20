'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useQuery, useApolloClient, ApolloError} from '@apollo/client';
import {GET_CART, GET_SESSION} from "@/graphql/defs/cart";
import {Cart, Customer} from "@/graphql/defs/types/graphql";


type CartSession = {
    cart: Cart | null
    customer: Customer | null
    loading: boolean | null
    error: ApolloError | undefined
}

const CartContext = createContext<CartSession>({
    cart: null,
    customer: null,
    loading: null,
    error: undefined
});

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: {
    children: ReactNode
}) {
    const { data, loading, error } = useQuery(GET_CART, {
        fetchPolicy: 'no-cache'
    })

    return (
        <CartContext.Provider value={{
            cart: data?.cart ,
            customer: data?.customer,
            loading,
            error
        }}>
            {children}
        </CartContext.Provider>
    );
}
