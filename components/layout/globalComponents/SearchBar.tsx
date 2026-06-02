'use client'
import { ChevronLeft, Loader, Search, XIcon } from "lucide-react";
import HeaderSearchResults from "@/components/layout/globalComponents/HeaderSearchResults";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PRICE_RANGE } from "@/components/primitives/Filters/PriceFilter";

interface SearchBarProps {
    onSearchExpand?: (expanded: boolean) => void;
}

const SearchBar = ({ onSearchExpand }: SearchBarProps) => {
    const { search, setSearch, search_status, syncCategories, syncBrands, synPriceRange, syncOnSale, setInStock, setSort, clearVariations, searchMounted } = useStore();
    const router = useRouter();
    const path = usePathname();
    const [searchValue, setSearchValue] = useState('');
    // Tracks the last value the user typed locally. Used to ignore the
    // store→input mirror effect while typing — otherwise rapid deletion races
    // with URL/router echoes that briefly re-set store.search to a stale value
    // and flicker the deleted letters back into the input.
    const lastTypedRef = useRef('');
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [mounted, setMounted] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [scrollHeight, setScrollHeight] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollHeight(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle initial load and subsequent URL changes
    // useEffect(() => {
    //     if (!mounted) return; // Don't run until component is mounted

    //     const query = searchParams.get('q');

    //     if ((query && !isInitialized) || isInitialized) {
    //         // setSearch(query ? decodeURIComponent(query) : '');
    //     }

    //     if (!isInitialized) {
    //         setIsInitialized(true);
    //     }
    // }, [searchParams, setSearch, isInitialized, mounted]);

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
        // the 1s debounce — gives power users a way to skip the wait.
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
        setIsFocused(true);
        onSearchExpand?.(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        onSearchExpand?.(false);
    };

    return (
        <div className="w-full pt-2 px-3 md:p-0">
            <div className={cn("flex-1 transition-all duration-200 flex items-center gap-1 mx-auto", (isFocused || scrollHeight < 100) ? "w-full" : "md:w-full w-1/2")}>
                {path !== '/' && (
                    <button
                        onClick={() => router.back()}
                        className=" hidden w-10 h-10  items-center justify-center"
                    >
                        <ChevronLeft className="text-white w-8" />
                    </button>
                )}

                <div className="text-primary-700 flex-1 p-1 lg:p-0 bg-transparent w-1/2 lg:bg-transparent">
                    <div className="bg-white/60 backdrop-blur-sm border lg:border border-primaryColor/20 py-1 md:py-1 flex
                items-center space-x-0 lg:space-x-1.5 px-2 pr-3 xl:px-5 rounded-full lg:rounded-[25px] h-10 lg:h-full">
                        <input
                            value={mounted ? searchValue : ''}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            type="text"
                            placeholder="Quick Search"
                            className="text-primaryColor/80 border-none focus:border-none focus:outline-none focus:ring-0 bg-transparent w-full text-base"
                            suppressHydrationWarning
                        />
                        {(search_status === 'stalled' || search_status === 'loading') ? (
                            <Loader className="text-primaryColor animate-spin w-5 h-5 lg:w-auto lg:h-auto" />
                        ) : search.length > 0 ? (
                            <button onClick={handleSearchClear} className={mounted ? '' : 'opacity-0'}>
                                <XIcon className="text-primaryColor w-5 h-5 lg:w-auto lg:h-auto" />
                            </button>
                        ) : (
                            <Search className="text-primaryColor/80 w-5 h-5 lg:w-auto lg:h-auto mr-4" />
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default SearchBar;