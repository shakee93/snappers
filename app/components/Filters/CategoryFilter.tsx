import {Popover, Transition} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import React, {Fragment, useState} from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";

interface CategoryFilterProps {
    categories: ProductCategory[]
}

const CategoryFilter = ({categories}: CategoryFilterProps) => {
    const { syncCategories } = useStore()
    const [categoriesState, setCategoriesState] = useState<number[]>([]);

    const handleChangeCategories = (checked: boolean, name: number) => {

        if (name === 0 && checked) {
            setCategoriesState([])
            syncCategories([])
            return
        }

        checked
            ? setCategoriesState([...categoriesState, name])
            : setCategoriesState(categoriesState.filter((i) => i !== name));
    };

    const icon =  <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M8 2V5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16 2V5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 13H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 17H12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16 3.5C19.33 3.68 21 4.95 21 9.65V15.83C21 19.95 20 22.01 15 22.01H9C4 22.01 3 19.95 3 15.83V9.65C3 4.95 4.67 3.69 8 3.5H16Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>

    return (
        <FilterPopover
            title='Categories'
            icon={icon}
            active={!!categoriesState.length}
            onClear={() =>{
                setCategoriesState([])
                syncCategories([])
            }}

        >
            {({ open, close }) => (
                <>

                    <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">

                        <div className="relative flex flex-col px-5 py-6 space-y-5">
                            <Checkbox
                                name="All Categories"
                                label="All Categories"
                                defaultChecked={categoriesState.length === 0}
                                onChange={(checked) =>
                                    handleChangeCategories(checked, 0)
                                }
                            />

                            <div className="w-full border-b  border-neutral-200 dark:border-neutral-700" />
                            <div className='grid grid-cols-2 gap-2'>
                                {categories.map((item) => (
                                    <div key={item.databaseId} className="">
                                        <Checkbox
                                            name={item.slug || ''}
                                            label={`${item.name} (${item.count})`}
                                            defaultChecked={categoriesState.includes(item.databaseId)}
                                            onChange={(checked) =>
                                                handleChangeCategories(checked, item.databaseId)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 bg-neutral-50 dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex items-center justify-between">
                            <ButtonThird
                                onClick={() => {
                                    close();
                                    setCategoriesState([]);
                                    syncCategories([])
                                }}
                                sizeClass="px-4 py-2 sm:px-5"
                            >
                                Clear
                            </ButtonThird>
                            <ButtonPrimary
                                onClick={() => {
                                    syncCategories(categoriesState)
                                    close()
                                }}
                                sizeClass="px-4 py-2 sm:px-5"
                            >
                                Apply
                            </ButtonPrimary>
                        </div>
                    </div>
                </>
            )}
        </FilterPopover>
    );
}

export default CategoryFilter