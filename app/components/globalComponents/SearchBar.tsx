'use client'
import { ChevronLeft, Loader, Search, XIcon } from "lucide-react";
import { useStore } from "@/store/store";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
    onSearchExpand?: (expanded: boolean) => void;
}

const SearchBar = ({ onSearchExpand }: SearchBarProps) => {
    const { search, setSearch, search_status } = useStore();
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    const [mounted, setMounted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle initial load and subsequent URL changes
    useEffect(() => {
        if (!mounted) return;

        const query = searchParams.get('q');

        if ((query && !isInitialized) || isInitialized) {
            setSearch(query ? decodeURIComponent(query) : '');
        }

        if (!isInitialized) {
            setIsInitialized(true);
        }
    }, [searchParams, setSearch, isInitialized, mounted]);

    // Notify parent component about search expansion
    useEffect(() => {
        onSearchExpand?.(isFocused || !!search);
    }, [isFocused, search, onSearchExpand]);

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
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const isExpanded = isFocused || !!search;

    return (
        <div className="flex items-center">
            {/* Mobile/Tablet Search - Always visible on mobile and tablet */}
            <div className="lg:hidden w-full bg-gradient-to-br from-blue-400 to-blue-600 p-3">
                <div className="relative">
                    <input
                        ref={inputRef}
                        value={mounted ? search : ''}
                        onChange={handleSearchChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        type="text"
                        placeholder="Type to Quick Search"
                        className="w-full h-10 pl-4 pr-10 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        suppressHydrationWarning
                    />
                    <div className="absolute right-3 top-0 w-10 h-10 flex items-center justify-center pointer-events-none">
                        <Search className="text-blue-600 w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Desktop Search - Hidden on mobile and tablet */}
            <div className="hidden lg:block relative overflow-hidden w-full">
                <div className="relative w-full py-0.5 px-0.5">
                    {/* Search Icon - Animated position */}
                    <motion.div 
                        className="absolute top-0 w-10 h-10 flex items-center justify-center pointer-events-none z-10"
                        initial={{ left: "calc(100% - 40px)" }}
                        animate={{ 
                            left: isExpanded ? "0px" : "calc(100% - 40px)"
                        }}
                        transition={{ 
                            duration: 0.3, 
                            ease: "easeInOut" 
                        }}
                    >
                        <Search className="text-primaryColor w-5 h-5 mt-1" />
                    </motion.div>

                    {/* Static Input Container */}
                    <div className={`relative transition-all duration-300 ease-in-out ${isExpanded ? 'w-full' : 'w-10'}`}>
                        <motion.input
                            ref={inputRef}
                            value={mounted ? search : ''}
                            onChange={handleSearchChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            type="text"
                            className={`
                                h-10 text-sm border-none outline-none pl-10 pr-4 w-full rounded-full transition-colors duration-300
                                ${isExpanded ? 'cursor-text bg-transparent border' : 'cursor-pointer bg-transparent border'}
                            `}
                            style={{
                                borderColor: isExpanded ? '#1b40af33' : '#3b82f6'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isExpanded ? 1 : 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Action Icons - Only visible when focused or has content */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div 
                                className="absolute right-2 top-0 w-6 h-10 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {(search_status === 'stalled' || search_status === 'loading') ? (
                                    <Loader className="text-primaryColor animate-spin w-4 h-4" />
                                ) : search.length > 0 ? (
                                    <button 
                                        onClick={handleSearchClear} 
                                        className={mounted ? 'hover:bg-gray-100 rounded-full p-1' : 'opacity-0'}
                                    >
                                        <XIcon className="text-primaryColor w-4 h-4" />
                                    </button>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;