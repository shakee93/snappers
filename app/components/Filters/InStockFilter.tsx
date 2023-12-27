import {Popover, Transition} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import React, {Fragment, useEffect, useState} from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import Slider from "rc-slider";
import {Package, XIcon} from "lucide-react";



const InStockFilter = () => {

    const { setInStock, sidebar: {on_sale} } = useStore()
    const [inStock, setInStockState] = useState(false);


    useEffect(() => {
        setInStock(inStock)
    }, [inStock])

    return (
        <div
            className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none cursor-pointer select-none ${
                inStock
                    ? "border-primary-500 bg-primary-50 text-primary-900"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
            onClick={() => setInStockState(!inStock)}
        >
            <Package className='stroke-1 w-4'/>
             <span className="line-clamp-1 ml-2">In Stock</span>
            {inStock && <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">
                <XIcon className='p-0.5'/>
            </div>}
        </div>
    );
}

export default InStockFilter