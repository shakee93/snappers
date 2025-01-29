'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {ApolloError, useLazyQuery, useMutation} from '@apollo/client';
import {ADD_TO_CART, GET_CART, REMOVE_ITEMS_FROM_CART, UPDATE_CART_ITEM_QUANTITY} from "@/graphql/defs/cart";
import {Cart, Customer} from "@/graphql/types/graphql";


type CartSession = {
    cart: Cart | null
    customer: Customer | null
    loading: boolean | null
    error?: ApolloError
    updateCart: (key: string, quantity: number) => void
    removeFromCart: (keys : string[]) => void
    getCart: () => void
    addToCart: (id : number, quantity?: number, variation?: number) => void | Promise<any>
    setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>
    clearCart: () => void
    refreshCart: () => void
}


const CartContext = createContext<CartSession>({
    cart: null,
    customer: null,
    loading: null,
    removeFromCart : (keys) => {},
    addToCart : (id) => {},
    updateCart : (key, q) => {},
    getCart : () => {},
    setCustomer: () => {},
    clearCart: () => {},
    refreshCart: () => {}
});

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: {
    children: ReactNode
}) {
    const [cart, setCart] = useState<Cart | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(false)

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

    const [getCart, {  error }] = useLazyQuery(GET_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData
    })

    const [_removeFromCart, { data: cartData}] = useMutation(REMOVE_ITEMS_FROM_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData
    })

    const [_addToCart] = useMutation(ADD_TO_CART, {
        fetchPolicy: 'no-cache',
        onCompleted: refreshData,
    });

    const [_updateCart] = useMutation(UPDATE_CART_ITEM_QUANTITY, {
        onCompleted: refreshData
    });

    const removeFromCart = async (keys: string[] = [], all: boolean = false) => {
        setLoading(true)

        return await _removeFromCart({
            variables: {
                keys: keys,
                all: all
            }
        }).finally(() => setLoading(false))
    }

    const clearCart = async () => {
        return await removeFromCart([], true);
    }

    const refreshCart = async () => {
        return await getCart();
    }

    const addToCart = async (id: number, quantity?: number, variation?: number) => {

       return await _addToCart({
           variables: {
               productId: id,
               quantity: quantity,
               variationId: variation
           },
       })

    }

    const updateCart = async (key: string, quantity: number) => {
        setLoading(true)

        return await _updateCart({
            variables: {
                items: [{
                    key,
                    quantity
                }]
            }
        }).finally(() => setLoading(false))
    }

    useEffect(() => {
        getCart()
    }, [])

    return (
        <CartContext.Provider value={{
            cart,
            customer,
            loading,
            error,
            updateCart,
            removeFromCart,
            addToCart,
            getCart,
            setCustomer,
            clearCart,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
}
