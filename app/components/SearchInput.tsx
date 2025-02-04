import {useInstantSearch, useSearchBox} from "react-instantsearch";
import {Search} from "lucide-react";
import {useStore} from "@/store/store";
import {useDeferredValue, useEffect} from "react";
import { useDebounce } from 'use-debounce';
import React from 'react';

interface SearchInputProps {
    bindToStore?: boolean;
    show?: boolean;
    onSearchChange?: (value: any) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ show = true, bindToStore = false, onSearchChange }) => {
    const {
        query,
        refine,
        clear,
    } = useSearchBox();

    const { search } = useStore()
    const [value] = useDebounce(search, 300);

    useEffect(() => {

        if (!bindToStore) {
            return;
        }

        refine(value);
    }, [value])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchChange) {
            onSearchChange(event.target.value);
        }
    };

    if (!show) {
        return <></>
    }


    return  <form
        className="flex-1 text-primary-700"
    >
        <div className="bg-primaryColor/5 border border-primaryColor/20 py-2 flex items-center space-x-1.5 px-5 rounded-2xl h-full ">
            <Search className='text-primaryColor' />
            <input
                type="text"
                placeholder="Type to Quick Search"
                defaultValue={query}
                onChange={handleChange}
                className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm"
                autoFocus
            />
        </div>
        <input type="submit" hidden value="" />
    </form>;
}

export default SearchInput