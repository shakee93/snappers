'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {
    useQuery,
    useApolloClient,
    ApolloError,
    ApolloQueryResult,
    OperationVariables,
    useMutation, FetchResult
} from '@apollo/client';
import {ADD_TO_CART, GET_CART, GET_SESSION, REMOVE_ITEMS_FROM_CART} from "@/graphql/defs/cart";
import {Cart, Customer} from "@/graphql/defs/types/graphql";


type CartSession = {
    cart: Cart | null
    customer: Customer | null
    loading: boolean | null
    error?: ApolloError
    updateCart?: () => void
    removeFromCart: (keys : string[]) => void
    addToCart: (id : number) => void
}

const CartContext = createContext<CartSession>({
    cart: null,
    customer: null,
    loading: null,
    removeFromCart : (keys) => {},
    addToCart : (id) => {}
});

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: {
    children: ReactNode
}) {
    const [cart, setCart] = useState<Cart | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)

    const refreshData = (data: {
        [key: string] : {
            cart: Cart,
            customer: Customer
        }
    }) => {
        const key = Object.keys(data)[0]
        setCart(data?.[key]?.cart)
        setCustomer(data?.[key]?.customer)
    }

    const { loading, error } = useQuery(GET_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData
    })

    const [_removeFromCart, { data: cartData}] = useMutation(REMOVE_ITEMS_FROM_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData
    })

    const [_addToCart, { loading: adding }] = useMutation(ADD_TO_CART, {
        onCompleted: refreshData
    });

    const updateCart = () => {

    }

    const removeFromCart = async (keys: string[] = []) => {

        return await _removeFromCart({
            variables: {
                keys: keys
            }
        })

    }

    const addToCart = async (id: number) => {

       return await _addToCart({
           variables: {
               productId: id
           },
       })

    }


    return (
        <CartContext.Provider value={{
            cart,
            customer,
            loading,
            error,
            updateCart,
            removeFromCart,
            addToCart
        }}>
            {children}
        </CartContext.Provider>
    );
}
