import {Popover, Transition} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import React, {Fragment, useEffect, useState} from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import Radio from "@/shared/Radio/Radio";

const DATA_sortOrderRadios = [
    { name: "Name", id: "name:asc" },
    { name: "Most Popular", id: "totalSales(missing_values: last):desc" },
    { name: "Best Rating", id: "reviewCount(missing_values: last):desc" },
    { name: "Newest", id: "databaseId:desc" },
    { name: "Price Low - High", id: "rawPriceNumber(missing_values: first):asc" },
    { name: "Price High - Low", id: "rawPriceNumber(missing_values: last):desc" },
];

const CategoryFilter = () => {
    const { setSort, sidebar: {sort } } = useStore()
    const [sortOrderStates, setSortOrderStates] = useState<string>("");


    useEffect(() => {
        setSort(sortOrderStates)
    }, [sortOrderStates])

    const icon =  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
        <path
            d="M11.5166 5.70834L14.0499 8.24168"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M11.5166 14.2917V5.70834"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M8.48327 14.2917L5.94995 11.7583"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M8.48315 5.70834V14.2917"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6025 1.66667 10.0001 1.66667C5.39771 1.66667 1.66675 5.39763 1.66675 10C1.66675 14.6024 5.39771 18.3333 10.0001 18.3333Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>


    return (
        <FilterPopover
            title= {sortOrderStates
                ? DATA_sortOrderRadios.filter(
                    (i) => i.id === sortOrderStates
                )[0].name
                : "Sort order"}
            icon={icon}
            active={!!sort}
            onClear={() =>{
                setSortOrderStates("")
                setSort("")
            }}
            className={'lg:max-w-sm right-0'}

        >
            {({ open, close }) => (
                <>

                    <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                        <div className="relative flex flex-col px-5 py-6 space-y-5">
                            {DATA_sortOrderRadios.map((item) => (
                                <Radio
                                    id={item.id}
                                    key={item.id}
                                    name="radioNameSort"
                                    label={item.name}
                                    defaultChecked={sortOrderStates === item.id}
                                    onChange={v => {
                                        setSortOrderStates(v)
                                        close()
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                </>
            )}
        </FilterPopover>
    );
}

export default CategoryFilter