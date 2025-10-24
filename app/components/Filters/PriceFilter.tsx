"use client"
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useEffect, useState, useCallback } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import Slider from "rc-slider";
import { useInstantSearch } from "react-instantsearch";
import { UiState } from "instantsearch.js";

interface BrandFilterProps {
}

export const PRICE_RANGE = [500, 500000];

type MyUiState = UiState & {
    product: {
        priceRange: number[];
        query?: string;
    }
}

const PriceFilter = ({ }: BrandFilterProps) => {
    const { synPriceRange, sidebar: { priceRange } } = useStore()
    const [rangePrices, setRangePrices] = useState(priceRange || PRICE_RANGE);
    const { setUiState } = useInstantSearch<MyUiState>();

    // URL synchronization is now handled by InstantSearch routing
    // No need for manual URL manipulation

    useEffect(() => {
        // Update store
        synPriceRange(rangePrices);

        // Update UI state
        setUiState(prev => {
            return {
                ...prev,
                product: {
                    ...(prev.product || {}),
                    priceRange: rangePrices,
                    query: prev.product?.query || '',
                }
            }
        });
    }, [rangePrices, setUiState, synPriceRange]);

    const icon = <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M8.67188 14.3298C8.67188 15.6198 9.66188 16.6598 10.8919 16.6598H13.4019C14.4719 16.6598 15.3419 15.7498 15.3419 14.6298C15.3419 13.4098 14.8119 12.9798 14.0219 12.6998L9.99187 11.2998C9.20187 11.0198 8.67188 10.5898 8.67188 9.36984C8.67188 8.24984 9.54187 7.33984 10.6119 7.33984H13.1219C14.3519 7.33984 15.3419 8.37984 15.3419 9.66984"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 6V18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>

    return (
        <div className="overflow-hidden w-full rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <div className="relative flex flex-col px-4 py-4 w-full space-y-4">
                <div className="space-y-5">
                    <span className="font-medium">Price range</span>
                    <br />
                    <span className='pt-1'>LKR {rangePrices[0].toLocaleString()} - LKR {rangePrices[1].toLocaleString()}</span>
                    <div className="w-full">
                        <Slider
                            range
                            min={PRICE_RANGE[0]}
                            max={PRICE_RANGE[1]}
                            step={1}
                            defaultValue={[rangePrices[0], rangePrices[1]]}
                            allowCross={false}
                            onChange={(_input: number | number[]) =>
                                setRangePrices(_input as number[])
                            }
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label
                            htmlFor="minPrice"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                            Min price
                        </label>
                        <div className="mt-1 flex flex-row items-center gap-4 rounded-md">
                            <span className="pointer-events-none text-neutral-500 sm:text-sm">
                                LKR
                            </span>
                            <input
                                type="number"
                                max={PRICE_RANGE[1]}
                                min={PRICE_RANGE[0]}
                                name="minPrice"
                                id="minPrice"
                                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                                value={rangePrices[0]}
                                onChange={e => setRangePrices([parseInt(e.target.value) || PRICE_RANGE[0], rangePrices[1]])}
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor="maxPrice"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                            Max price
                        </label>
                        <div className="mt-1 flex flex-row items-center gap-4 rounded-md">
                            <span className="pointer-events-none text-neutral-500 sm:text-sm">
                                LKR
                            </span>
                            <input
                                type="number"
                                max={PRICE_RANGE[1]}
                                min={PRICE_RANGE[0]}
                                name="maxPrice"
                                id="maxPrice"
                                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                                value={rangePrices[1]}
                                onChange={e => setRangePrices([rangePrices[0], parseInt(e.target.value) || PRICE_RANGE[1]])}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PriceFilter