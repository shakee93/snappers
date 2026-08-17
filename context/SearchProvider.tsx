'use client';
import React, {createContext, ReactNode, useContext} from 'react';
import {TypesenseClient} from "@/utils/lib/typesense";

interface SearchContextProps {
    client: typeof TypesenseClient
}
const SearchContext = createContext<SearchContextProps>({
    client: TypesenseClient
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
