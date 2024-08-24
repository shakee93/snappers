import {Popover, Transition} from "@headlessui/react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import React, {Fragment, useMemo, useState} from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import {useRefinementList} from "react-instantsearch";

interface CategoryFilterProps {
    categories: ProductCategory[]
}

const CategoryFilter = ({categories}: CategoryFilterProps) => {
    const { syncCategories, sidebar: {categories : catState } } = useStore()
    const [categoriesState, setCategoriesState] = useState<number[]>([]);
    const {items: categoriesFacet} = useRefinementList({
        attribute: 'categories_facet',
    });

    const handleChangeCategories = (checked: boolean, name: number) => {

        if (name === 0 && checked) {
            setCategoriesState([])
            syncCategories([])
            return
        }

        checked
            ? setCategoriesState([...categoriesState, name])
            : setCategoriesState(categoriesState.filter((i) => i !== name));


        syncCategories(categoriesState);
    };

    const facetedCategories = useMemo(() => {
        return categories.filter(b =>
            categoriesFacet.map(f =>  Number(f.value)).includes(b.databaseId)
        )
    }, [categoriesFacet, categories])

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
        <div className="overflow-hidden relative w-full z-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">


            <div className="relative flex flex-col px-4 py-4 w-full space-y-5">
                <span className='font-medium'>Categories</span>
                <Checkbox
                    name="All Categories"
                    label="All Categories"
                    defaultChecked={categoriesState.length === 0}
                    onChange={(checked) =>
                        handleChangeCategories(checked, 0)
                    }
                />

                <div className="w-full border-b  border-neutral-200 dark:border-neutral-700" />

                {facetedCategories.length > 0 ?
                    <div className='grid grid-cols-1 gap-2'>
                        {facetedCategories.map((item) => (
                            <div key={item.databaseId} className="">
                                <Checkbox
                                    name={item.slug || ''}
                                    // label={`${item.name} (${item.count})`}
                                    label={`${item.name} (${categoriesFacet.find(f => item.databaseId === Number(f.value))?.count})`}
                                    defaultChecked={categoriesState.includes(item.databaseId)}
                                    onChange={(checked) =>
                                        handleChangeCategories(checked, item.databaseId)
                                    }
                                />
                            </div>
                        ))}
                    </div> :
                    <div className='text-sm'>No Categories found for this search.</div>
                }
            </div>
        </div>
    );
}

export default CategoryFilter