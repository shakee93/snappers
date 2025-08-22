'use client'
import { ChevronLeft, Loader, Search, XIcon } from "lucide-react";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearchExpand?: (expanded: boolean) => void;
}

const SearchBar = ({ onSearchExpand }: SearchBarProps) => {
    const { search, setSearch, search_status } = useStore();
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();

    const [mounted, setMounted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
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
    useEffect(() => {
        if (!mounted) return; // Don't run until component is mounted

        const query = searchParams.get('q');

        if ((query && !isInitialized) || isInitialized) {
            setSearch(query ? decodeURIComponent(query) : '');
        }

        if (!isInitialized) {
            setIsInitialized(true);
        }
    }, [searchParams, setSearch, isInitialized, mounted]);

    const handleSearchClear = () => {
        setSearch("");
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        router.push(url.pathname + url.search);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const url = new URL(window.location.href);
        if (value) {
            url.searchParams.set('q', value);
        } else {
            url.searchParams.delete('q');
        }
        router.push(url.pathname + url.search);
    };

    const handleFocus = () => {
        setIsFocused(true);
        onSearchExpand?.(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        onSearchExpand?.(false);
    };

    return (
        <div className="w-full pt-2 px-3">
            <div className={cn("flex-1 transition-all duration-200 flex items-center gap-1 mx-auto", (isFocused || scrollHeight < 100) ? "w-full" : "w-1/2")}>
                {path !== '/' && (
                    <button
                        onClick={() => router.back()}
                        className="hidden md:hidden w-10 h-10 flex items-center justify-center"
                    >
                        <ChevronLeft className="text-white w-8" />
                    </button>
                )}

                <div className="text-primary-700 flex-1 p-1 lg:p-0 bg-transparent w-1/2 lg:bg-transparent">
                    <div className="bg-white border-2 lg:border border-primaryColor/20 py-1 md:py-1 flex
                items-center space-x-0 lg:space-x-1.5 px-2 xl:px-5 rounded-full lg:rounded-[25px] h-10 lg:h-full">
                        <input
                            value={mounted ? search : ''}
                            onChange={handleSearchChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            type="text"
                            placeholder="Quick Search"
                            className="border-none focus:border-none focus:outline-none focus:ring-0 bg-transparent w-full text-sm lg:text-base"
                            suppressHydrationWarning
                        />
                        {(search_status === 'stalled' || search_status === 'loading') ? (
                            <Loader className="text-primaryColor animate-spin w-5 h-5 lg:w-auto lg:h-auto" />
                        ) : search.length > 0 ? (
                            <button onClick={handleSearchClear} className={mounted ? '' : 'opacity-0'}>
                                <XIcon className="text-primaryColor w-5 h-5 lg:w-auto lg:h-auto" />
                            </button>
                        ) : (
                            <Search className="text-primaryColor w-5 h-5 lg:w-auto lg:h-auto" />
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default SearchBar;