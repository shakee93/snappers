
import React, { useEffect, useState} from "react";
import {useStore} from "@/store/store";
import {Package, XIcon} from "lucide-react";

const InStockFilter = () => {

    const { setInStock, sidebar: {on_sale} } = useStore()
    const [inStock, setInStockState] = useState(true);


    useEffect(() => {
        setInStock(inStock)
    }, [inStock])

    return (
        <div
            className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none cursor-pointer select-none ${
                inStock
                    ? "border border-2 border-[#2563eb] bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
            onClick={() => setInStockState(!inStock)}
        >
            <Package className='stroke-1 w-4'/>
             <span className="line-clamp-1 ml-2">In Stock</span>
            {inStock && <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">
                <XIcon className='p-0.5 w-4 h-4 text-black'/>
            </div>}
        </div>
    );
}

export default InStockFilter