'use client'
import { Loader, Search, XIcon } from "lucide-react";
import { useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRICE_RANGE } from "@/components/global/primitives/Filters/PriceFilter";

interface SearchBarProps {
    onSearchExpand?: (expanded: boolean) => void;
    placeholder?: string;
}

const SearchBar = ({
    onSearchExpand,
    placeholder = "Search for brand, products or categories...",
}: SearchBarProps) => {
    const { search, setSearch, search_status, syncCategories, syncBrands, synPriceRange, syncOnSale, setInStock, setSort, clearVariations } = useStore();
    const router = useRouter();
    const [searchValue, setSearchValue] = useState('');
    // Tracks the last value the user typed locally. Used to ignore the
    // store→input mirror effect while typing - otherwise rapid deletion races
    // with URL/router echoes that briefly re-set store.search to a stale value
    // and flicker the deleted letters back into the input.
    const lastTypedRef = useRef('');
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearchClear = () => {
        // Cancel any pending typed-debounce so it can't overwrite the clear.
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        // Clear search state
        setSearch("");

        // Reset all filters in store
        syncCategories([]);
        syncBrands([]);
        synPriceRange(PRICE_RANGE);
        syncOnSale(false);
        setInStock(true);
        setSort("");
        clearVariations();
        setSearchValue('');
        lastTypedRef.current = '';

        // Clear all URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        url.searchParams.delete('query');
        url.searchParams.delete('categories');
        url.searchParams.delete('brands');
        url.searchParams.delete('priceRange');
        url.searchParams.delete('on_sale');
        url.searchParams.delete('in_stock');
        url.searchParams.delete('sort');

        // Clear all variation parameters
        const paramsToDelete: string[] = [];
        url.searchParams.forEach((_, key) => {
            if (key.startsWith('variation_')) {
                paramsToDelete.push(key);
            }
        });
        paramsToDelete.forEach(key => url.searchParams.delete(key));

        router.push(url.pathname + url.search);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        lastTypedRef.current = value;
        setSearchValue(value);

        // Defer firing the actual search (which drives results + URL updates)
        // until the user has paused for 1s. Both typing and deleting feel
        // instant in the input, but no result/URL churn happens mid-stream.
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setSearch(value);
        }, 1000);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Pressing Enter commits the current value immediately and bypasses
        // the 1s debounce - gives power users a way to skip the wait.
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
            setSearch(searchValue);
        }
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);

    useEffect(() => {
        // Only mirror store→input on external changes (navigation, clear, URL
        // sync). Skipping when it matches what the user just typed prevents
        // stale store echoes from overwriting in-flight deletions. External
        // changes also cancel any pending typed-debounce so it can't overwrite
        // the reset a moment later.
        if (search === lastTypedRef.current) return;
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        lastTypedRef.current = search;
        setSearchValue(search);
    }, [search]);

    const handleFocus = () => {
        onSearchExpand?.(true);
    };

    const handleBlur = () => {
        onSearchExpand?.(false);
    };

    return (
        <div className="w-full">
            <div className="mx-auto flex w-full flex-1 items-center gap-1">
                <div className="flex-1 bg-transparent">
                    <div className="flex h-11 w-full items-center rounded-full border-2 border-header-green bg-white px-5 shadow-sm">
                        <input
                            value={mounted ? searchValue : ''}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            type="text"
                            placeholder={placeholder}
                            className="w-full border-none bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-none focus:outline-none focus:ring-0"
                            suppressHydrationWarning
                        />
                        {(search_status === 'stalled' || search_status === 'loading') ? (
                            <Loader className="h-5 w-5 shrink-0 animate-spin text-neutral-400" />
                        ) : search.length > 0 ? (
                            <button type="button" onClick={handleSearchClear} className={mounted ? '' : 'opacity-0'} aria-label="Clear search">
                                <XIcon className="h-5 w-5 shrink-0 text-neutral-500" />
                            </button>
                        ) : (
                            <Search className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
