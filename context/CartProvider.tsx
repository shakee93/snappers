'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { ApolloError, useLazyQuery, useMutation } from '@apollo/client';
import { ADD_TO_CART, GET_CART, REMOVE_ITEMS_FROM_CART, UPDATE_CART_ITEM_QUANTITY } from "@/graphql/defs/cart";
import { Cart, Customer } from "@/graphql/types/graphql";
import { toast } from "sonner";


type CartSession = {
    cart: Cart | null
    customer: Customer | null
    loading: boolean | null
    error?: ApolloError
    updateCart: (key: string, quantity: number) => void
    removeFromCart: (keys: string[]) => void
    getCart: () => void
    addToCart: (id: number, quantity?: number, variation?: number, productData?: any) => void | Promise<any>
    setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>
    clearCart: () => void
    refreshCart: () => Promise<any>
    isCartOpen: boolean
    setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>
}


const CartContext = createContext<CartSession>({
    cart: null,
    customer: null,
    loading: null,
    removeFromCart: (keys) => { },
    addToCart: (id, quantity, variation, productData) => { },
    updateCart: (key, q) => { },
    getCart: () => { },
    setCustomer: () => { },
    clearCart: () => { },
    refreshCart: () => Promise.resolve(),
    isCartOpen: false,
    setIsCartOpen: () => { }
});

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: {
    children: ReactNode
}) {
    const [cart, setCart] = useState<Cart | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const isClearingRef = useRef(false)

    const refreshData = (data: any) => {
        // Handle removeItemsFromCart mutation response
        if (data?.removeItemsFromCart) {
            setCart(data.removeItemsFromCart.cart || null)
            // Don't update customer - this mutation doesn't return customer data
            return
        }
        
        // Handle addToCart mutation response
        if (data?.addToCart) {
            setCart(data.addToCart.cart || null)
            // Don't update customer - this mutation doesn't return customer data
            return
        }
        
        // Handle updateItemQuantities mutation response
        if (data?.updateItemQuantities) {
            setCart(data.updateItemQuantities.cart || null)
            // Don't update customer - this mutation doesn't return customer data
            return
        }
        
        // Handle updateShippingMethod mutation response
        if (data?.updateShippingMethod) {
            setCart(data.updateShippingMethod.cart || null)
            // Don't update customer - this mutation doesn't return customer data
            return
        }
        
        // Handle GET_CART query response (has both cart and customer)
        const key = Object.keys(data)[0]
        if (key && data[key]) {
            setCart(data[key].cart || data.cart || null)
        } else {
            // Fallback for direct cart/customer structure
            setCart(data?.cart || null)
        }
    }

    const [getCart, { error, data }] = useLazyQuery(GET_CART, {
        fetchPolicy: 'no-cache',
    })

    const [_removeFromCart, { data: removeCartData }] = useMutation(REMOVE_ITEMS_FROM_CART, {
        fetchPolicy: 'no-cache',
    })

    const [_addToCart, { data: addToCartData }] = useMutation(ADD_TO_CART, {
        fetchPolicy: 'no-cache',
    });

    const [_updateCart, { data: updateCartData }] = useMutation(UPDATE_CART_ITEM_QUANTITY);

    // Handle data from getCart
    useEffect(() => {
        if (data) {
            refreshData(data);
        }
    }, [data]);

    // Handle data from removeFromCart mutation (also applied in removeFromCart onCompleted)
    useEffect(() => {
        if (removeCartData) {
            refreshData(removeCartData)
            isClearingRef.current = false
        }
    }, [removeCartData]);

    // Handle data from addToCart mutation
    useEffect(() => {
        if (addToCartData) {
            refreshData(addToCartData);
        }
    }, [addToCartData]);

    // Handle data from updateCart mutation
    useEffect(() => {
        if (updateCartData) {
            refreshData(updateCartData);
        }
    }, [updateCartData]);

    const removeFromCart = useCallback(async (keys: string[] = [], all: boolean = false) => {
        setLoading(true)

        try {
            const result = await _removeFromCart({
                variables: {
                    keys: keys,
                    all: all
                },
            })

            // Cart state is refreshed by the removeCartData useEffect above,
            // which also resets isClearingRef — keep that as the single path.
            return result
        } finally {
            setLoading(false)
        }
    }, [_removeFromCart])

    const clearCart = useCallback(async () => {
        // Prevent clearing if already in progress
        if (isClearingRef.current) {
            return Promise.resolve()
        }
        
        // Prevent clearing if cart is already empty
        if (!cart || !cart.contents?.nodes || cart.contents.nodes.length === 0) {
            return Promise.resolve()
        }
        
        isClearingRef.current = true
        
        try {
            const result = await removeFromCart([], true)
            return result
        } catch (error: any) {
            // If we get a 500 error or server error, don't retry
            // The cart might already be cleared or session invalid
            if (error?.networkError?.statusCode === 500 || 
                error?.message?.includes('500') ||
                error?.graphQLErrors?.some((e: any) => e?.extensions?.code === 'INTERNAL_SERVER_ERROR')) {
                console.warn('Cart clear failed with 500 error - likely already cleared or session invalid. Skipping retry.');
                // Set cart to empty state to prevent further attempts
                setCart(null)
                return Promise.resolve()
            }
            // For other errors, re-throw
            throw error
        } finally {
            // Reset the clearing flag after a short delay to allow mutation to complete
            setTimeout(() => {
                isClearingRef.current = false
            }, 1000)
        }
    }, [cart, removeFromCart])

    const refreshCart = useCallback(async () => {
        try {
            return await getCart();
        } catch (error: any) {
            // If we get a 500 error, don't retry - session might be invalid
            if (error?.networkError?.statusCode === 500 || 
                error?.message?.includes('500') ||
                error?.graphQLErrors?.some((e: any) => e?.extensions?.code === 'INTERNAL_SERVER_ERROR')) {
                console.warn('Cart refresh failed with 500 error - session might be invalid. Skipping retry.');
                return Promise.resolve()
            }
            // For other errors, re-throw
            throw error
        }
    }, [getCart])

    // Helper function to check if a product is a pre-order product
    const isPreOrderProduct = (product: any) => {
        return product?.productTags?.nodes?.some(
            (tag: any) => tag.slug === 'pre-order'
        ) || false;
    };

    // Helper function to check if cart has pre-order products
    const cartHasPreOrderProducts = () => {
        if (!cart?.contents?.nodes) return false;

        return cart.contents.nodes.some((item: any) =>
            isPreOrderProduct(item.product?.node)
        );
    };

    // Helper function to check if cart has non-pre-order products
    const cartHasNonPreOrderProducts = () => {
        if (!cart?.contents?.nodes) return false;

        return cart.contents.nodes.some((item: any) =>
            !isPreOrderProduct(item.product?.node)
        );
    };

    const addToCart = async (id: number, quantity?: number, variation?: number, productData?: any) => {
        try {
            // Check pre-order restrictions before adding to cart
            const isProductPreOrder = productData ? isPreOrderProduct(productData) : false;

            if (isProductPreOrder && cartHasNonPreOrderProducts()) {
                toast.error("You can't add pre-order products with regular products in your cart.");
                return { error: "Pre-order restriction" };
            }

            if (!isProductPreOrder && cartHasPreOrderProducts()) {
                toast.error("You can't add regular products with pre-order products in your cart.");
                return { error: "Pre-order restriction" };
            }

            const data = await _addToCart({
                variables: {
                    productId: id,
                    quantity: quantity,
                    variationId: variation
                },
            })

            if (data?.data?.addToCart?.cartItem) {
                setIsCartOpen(true)
            }

            return data
        } catch (error: any) {
            console.error('Add to cart error:', error);

            // Handle GraphQL errors
            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                const graphQLError = error.graphQLErrors[0];
                const errorMessage = graphQLError.message || graphQLError.extensions?.message;

                if (errorMessage?.toLowerCase().includes("not have enough")) {
                    toast.error("There isn't enough stock for that quantity. Please try a smaller amount.");
                    return { error: "Insufficient stock" };
                }

                if (
                    errorMessage?.toLowerCase().includes("out of stock") ||
                    errorMessage?.toLowerCase().includes("not in stock") ||
                    errorMessage?.toLowerCase().includes("stock")
                ) {
                    toast.error("This product is currently out of stock.");
                    return { error: "Out of stock" };
                }

                if (errorMessage?.includes("cart") || errorMessage?.includes("add")) {
                    toast.error("Unable to add item to cart. Please login and try again.");
                    return { error: "Add to cart failed" };
                }

                toast.error("Unable to add item to cart. Please login and try again.");
                return { error: "Add to cart failed" };
            }

            // Handle network errors
            if (error.networkError) {
                toast.error("Unable to connect to the server. Please check your internet connection and try again.");
                return { error: "Network error" };
            }

            // Handle generic errors
            if (error.message?.includes("fetch") || error.message?.includes("network")) {
                toast.error("Unable to connect to the server. Please check your internet connection and try again.");
                return { error: "Network error" };
            }

            if (error.message?.includes("timeout")) {
                toast.error("Request timed out. Please try again.");
                return { error: "Timeout error" };
            }

            if (error.message?.includes("500") || error.message?.includes("Internal Server Error")) {
                toast.error("Server error occurred. Please try again in a few moments.");
                return { error: "Server error" };
            }

            // Fallback
            toast.error("An unexpected error occurred. Please try again.");
            return { error: "Unknown error" };
        }
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
            refreshCart,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}
