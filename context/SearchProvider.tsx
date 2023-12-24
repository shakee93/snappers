'use client';
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {ApolloError, FetchResult, useApolloClient, useMutation, useQuery} from '@apollo/client';
import {GET_CART} from "@/graphql/defs/cart";
import {LOGIN_CUSTOMER_MUTATION, REGISTER_CUSTOMER_MUTATION} from '@/graphql/defs/auth';
import {LoginResponse, Session} from "@/utils/type";
import {LoginCustomerMutation, LoginInput, RegisterCustomerMutation} from "@/graphql/types/graphql";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import {TypesenseClient} from "@/utils/lib/typesense";

interface SearchContextProps {
    client: any
}
const SearchContext = createContext<SearchContextProps>({
    client: null
});

export function useSearch() {
    return useContext(SearchContext);
}

export function SearchProvider({ children }: {
    children: ReactNode
}) {

    return (
        <SearchContext.Provider value={{
            client: TypesenseClient
        }}>
            {children}
        </SearchContext.Provider>
    );
}
