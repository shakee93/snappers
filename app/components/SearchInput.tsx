import { useInstantSearch, useSearchBox } from "react-instantsearch";
import { Search } from "lucide-react";
import { useStore } from "@/store/store";
import { useEffect } from "react";
import React from 'react';
import { UiState } from "instantsearch.js";

type MyUiState = UiState & {
    product: {
        query?: string;
    }
}

interface SearchInputProps {
    bindToStore?: boolean;
    show?: boolean;
    onSearchChange?: (value: any) => void;
}

// Module-level timer for debouncing
let timerId: NodeJS.Timeout | undefined;
const timeout = 0; // 300ms delay

const SearchInput: React.FC<SearchInputProps> = ({ show = true, bindToStore = false, onSearchChange }) => {
    const {
        query,
        refine,
        clear,
    } = useSearchBox({
        queryHook: queryHook
    });

    const { search } = useStore()
    const { setUiState } = useInstantSearch<MyUiState>();

    useEffect(() => {
        if (!bindToStore) {
            return;
        }

        refine(search);
    }, [search])

    useEffect(() => {

        // this state update here to prevent race condition between the search input and the instantsearch search query. so on route change, the search query is not erased.
        // setUiState(p => {
        //     return p
        // })
    }, [search])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchChange) {
            onSearchChange(event.target.value);
        }
    };

    if (!show) {
        return <></>
    }


    return <form
        className="flex-1 text-primary-700"
    >
        <div className="bg-primaryColor/5 border border-primaryColor/20 py-2 flex items-center space-x-1.5 px-5 rounded-2xl h-full ">
            <input
                type="text"
                placeholder="Type to Quick"
                defaultValue={query}
                onChange={handleChange}
                className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm"
                autoFocus
            />

            <Search className='text-primaryColor' />
        </div>
        <input type="submit" hidden value="" />
    </form>;
}


const queryHook = (query: string, hook: (query: string) => void) => {
    if (timerId) {
        clearTimeout(timerId);
    }

    timerId = setTimeout(() => hook(query), timeout);
}

export default SearchInput