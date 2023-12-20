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
import {
    ADD_TO_CART,
    GET_CART,
    GET_SESSION,
    REMOVE_ITEMS_FROM_CART,
    UPDATE_CART_ITEM_QUANTITY
} from "@/graphql/defs/cart";
import {Cart, Customer} from "@/graphql/types/graphql";


type CartSession = {
    cart: Cart | null
    customer: Customer | null
    loading: boolean | null
    error?: ApolloError
    updateCart: (key: string, quantity: number) => void
    removeFromCart: (keys : string[]) => void
    addToCart: (id : number) => void
}

const CartContext = createContext<CartSession>({
    cart: null,
    customer: null,
    loading: null,
    removeFromCart : (keys) => {},
    addToCart : (id) => {},
    updateCart : (key, q) => {}
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
        setCart(data?.[key]?.cart || data.cart)
        setCustomer(data?.[key]?.customer || data.customer)
    }

    const { data, loading, error } = useQuery(GET_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData
    })

    const [_removeFromCart, { data: cartData}] = useMutation(REMOVE_ITEMS_FROM_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData
    })

    const [_addToCart] = useMutation(ADD_TO_CART, {
        onCompleted: refreshData
    });

    const [_updateCart] = useMutation(UPDATE_CART_ITEM_QUANTITY, {
        onCompleted: refreshData
    });

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

    const updateCart = async (key: string, quantity: number) => {
        return await _updateCart({
            variables: {
                items: [{
                    key,
                    quantity
                }]
            }
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
