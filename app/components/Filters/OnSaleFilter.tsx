import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useEffect, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import Slider from "rc-slider";
import { XIcon } from "lucide-react";

interface BrandFilterProps {
}



const OnSaleFilter = ({ }: BrandFilterProps) => {

    const { syncOnSale, sidebar: { on_sale } } = useStore()
    const [isOnSale, setIsIsOnSale] = useState(false);


    useEffect(() => {
        syncOnSale(isOnSale)
    }, [isOnSale])

    return (
        <div
            className={`flex flex-col items-start justify-start px-4 py-4 text-sm rounded-xl w-full border focus:outline-none cursor-pointer select-none bg-white ${"border-neutral-200 gap-4 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }`}
            onClick={() => setIsIsOnSale(!isOnSale)}
        >
            <div className='flex hidden items-center'>
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3.9889 14.6604L2.46891 13.1404C1.84891 12.5204 1.84891 11.5004 2.46891 10.8804L3.9889 9.36039C4.2489 9.10039 4.4589 8.59038 4.4589 8.23038V6.08036C4.4589 5.20036 5.1789 4.48038 6.0589 4.48038H8.2089C8.5689 4.48038 9.0789 4.27041 9.3389 4.01041L10.8589 2.49039C11.4789 1.87039 12.4989 1.87039 13.1189 2.49039L14.6389 4.01041C14.8989 4.27041 15.4089 4.48038 15.7689 4.48038H17.9189C18.7989 4.48038 19.5189 5.20036 19.5189 6.08036V8.23038C19.5189 8.59038 19.7289 9.10039 19.9889 9.36039L21.5089 10.8804C22.1289 11.5004 22.1289 12.5204 21.5089 13.1404L19.9889 14.6604C19.7289 14.9204 19.5189 15.4304 19.5189 15.7904V17.9403C19.5189 18.8203 18.7989 19.5404 17.9189 19.5404H15.7689C15.4089 19.5404 14.8989 19.7504 14.6389 20.0104L13.1189 21.5304C12.4989 22.1504 11.4789 22.1504 10.8589 21.5304L9.3389 20.0104C9.0789 19.7504 8.5689 19.5404 8.2089 19.5404H6.0589C5.1789 19.5404 4.4589 18.8203 4.4589 17.9403V15.7904C4.4589 15.4204 4.2489 14.9104 3.9889 14.6604Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9 15L15 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M14.4945 14.5H14.5035"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9.49451 9.5H9.50349"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg> <span className="line-clamp-1 ml-2 text-md">On sale</span>
            </div>

            <span className='font-medium text-[16px] text-black'>On Sale </span>
            <div className="">
                <Checkbox
                    name='On Sale'
                    label='On Sale'
                    defaultChecked={isOnSale}
                    onChange={(checked) =>
                        setIsIsOnSale(checked)
                    }
                />
            </div>
        </div>
    );
}

export default OnSaleFilter