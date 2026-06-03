import React, { useEffect, useState } from "react";
import { useSearchBox } from "react-instantsearch";
import { Search } from "lucide-react";
import { useStore } from "@/store/store";

interface SearchInputProps {
    bindToStore?: boolean;
    show?: boolean;
    onSearchChange?: (value: string) => void;
}

// Module-level timer for debouncing
let timerId: NodeJS.Timeout | undefined;
const timeout = 300; // 300ms delay

const SearchInput: React.FC<SearchInputProps> = ({ show = true, bindToStore = false, onSearchChange }) => {
    const {
        query,
        refine,
    } = useSearchBox({
        queryHook: queryHook
    });

    const { search } = useStore()

    // Controlled value mirrors IS query so that navigation-driven clears
    // (routeToState sets query to '') are reflected in the DOM immediately.
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    useEffect(() => {
        if (!bindToStore) {
            return;
        }

        refine(search);
    }, [search])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        refine(event.target.value);
        if (onSearchChange) {
            onSearchChange(event.target.value);
        }
    };

    if (!show) {
        return null;
    }


    return <form
        className="flex-1 text-primary-700"
    >
        <div className="bg-primary-500/5 border border-primary-500/20 py-2 flex items-center space-x-1.5 px-5 rounded-2xl h-full ">
            <input
                type="text"
                placeholder="Type to Quick"
                value={inputValue}
                onChange={handleChange}
                className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-base"
                autoFocus
            />

            <Search className='text-primary-500' />
        </div>
        <input type="submit" hidden value="" />
    </form>;
}


const queryHook = (query: string, hook: (query: string) => void) => {
    if (timerId) {
        clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
        hook(query);
    }, timeout);
}

export default SearchInput