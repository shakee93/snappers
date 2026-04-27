import React from "react";
import { useStore } from "@/store/store";

const InStockFilter = () => {
    const { setInStock, setOutOfStock, sidebar: { in_stock } } = useStore();

    const handleInStockChange = () => {
        setInStock(!in_stock);
        setOutOfStock(false);
    };

    return (
        <div className="flex flex-col items-start gap-2 justify-start
        px-3 py-3 text-xs rounded-xl w-full border focus:outline-none cursor-pointer select-none bg-white
        border-neutral-200  dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400
        dark:hover:border-neutral-500">
            <div
                className={`flex items-center justify-start text-xs cursor-pointer select-none ${in_stock ? "text-primary-900" : "text-neutral-700 dark:text-neutral-300"
                    }`}
                onClick={handleInStockChange}
            >
                <input
                    type="checkbox"
                    checked={in_stock}
                    onChange={handleInStockChange}
                    className="w-5 h-5 mr-2 border-neutral-200 dark:border-neutral-700 rounded-sm bg-transparent text-sm
                    focus:ring-primary-500 focus:ring-action-primary"
                />
                <span className="line-clamp-1 text-slate-900 dark:text-slate-100">In Stock</span>
            </div>
        </div>
    );
}

export default InStockFilter;
