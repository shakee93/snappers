import React, { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { useSearchParams, useRouter } from 'next/navigation';

const InStockFilter = () => {
    const { setInStock, setOutOfStock } = useStore();
    const [inStock, setInStockState] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Read from URL on mount
        const stockStatus = searchParams.get('stock');
        if (stockStatus === 'in') {
            setInStockState(true);
            setInStock(true);
        }
    }, []);

    useEffect(() => {
        // Update URL when stock status changes
        const url = new URL(window.location.href);
        if (inStock) {
            url.searchParams.set('stock', 'in');
        } else {
            url.searchParams.delete('stock');
        }
        window.history.replaceState({}, '', url.toString());

        // Update store
        setInStock(inStock);
        setOutOfStock(false);
    }, [inStock]);

    const handleInStockChange = () => {
        setInStockState(!inStock);
    };

    return (
        <div className="flex flex-col items-start gap-2 justify-start
        px-4 py-4 text-sm rounded-xl w-full border focus:outline-none cursor-pointer select-none bg-white 
        border-neutral-200 gap-4 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 
        dark:hover:border-neutral-500">
            <div
                className={`flex items-center justify-start text-sm cursor-pointer select-none ${
                    inStock ? "text-primary-900" : "text-neutral-700 dark:text-neutral-300"
                }`}
                onClick={handleInStockChange}
            >
                <input
                    type="checkbox"
                    checked={inStock}
                    onChange={handleInStockChange}
                    className="w-6 h-6 mr-2 border-neutral-200 dark:border-neutral-700 rounded-sm bg-transparent
                    focus:ring-primary-500 focus:ring-action-primary"
                />
                <span className="line-clamp-1 text-slate-900 dark:text-slate-100">In Stock</span>
            </div>
        </div>
    );
}

export default InStockFilter;