import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import { useHits, useInstantSearch, useRefinementList } from "react-instantsearch";
// import {RefinementListItem} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { InstantSearchNextProps } from "react-instantsearch-nextjs";
import { UiState } from "instantsearch.js";

interface CategoryFilterProps {
    categories: ProductCategory[]
}

type MyUiState = UiState & {
    product: {
        categories: number[];
        query?: string;
        hello?: boolean;
    }
}
    ;

const CategoryFilter = ({ categories }: CategoryFilterProps) => {
    const { syncCategories, search, sidebar: { categories: catState } } = useStore()
    const [firstCategoryFacets, setFirstCategoryFacets] = useState<any[]>([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { brand } = useParams()
    const { hits, results } = useHits();
    const { uiState, setUiState } = useInstantSearch<MyUiState>();

    const { items: categoriesFacet } = useRefinementList({
        attribute: 'categories_facet',
    });

    // URL reading is now handled by InstantSearch routing
    // No need for manual URL parameter reading

    // URL synchronization is now handled by InstantSearch routing
    // No need for manual URL manipulation

    useEffect(() => {
        if (firstCategoryFacets.length === 0) {
            setFirstCategoryFacets(categoriesFacet)
        }
    }, [categoriesFacet, brand])

    useEffect(() => {
        if (search.length === 0) {
            // Do nothing
        } else {
            setFirstCategoryFacets(categoriesFacet);
        }
    }, [categoriesFacet, search])

    const handleChangeCategories = useCallback(
        (checked: boolean, name: number) => {
            if (name === 0 && checked) {
                syncCategories([])
                return
            }

            const newCategories = checked ? [...catState, name] : catState.filter((i) => i !== name);

            // this is to trigger the ui state change
            setUiState(prev => {
                return {
                    ...prev,
                    product: {
                        ...(prev.product || {}),
                        categories: newCategories,
                        query: prev.product?.query || '',
                    }
                }
            });

            syncCategories(newCategories);
        }, [catState, setUiState, syncCategories])


    useEffect(() => {
        console.log('uiState', uiState);
    }, [uiState])


    const facetedCategories = useMemo(() => {
        const sortedCategories = [...categories];

        // Sort by count from firstCategoryFacets (highest first)
        sortedCategories.sort((a, b) => {
            const countA = firstCategoryFacets.find(f => a.databaseId === Number(f.value))?.count || 0;
            const countB = firstCategoryFacets.find(f => b.databaseId === Number(f.value))?.count || 0;

            // If counts are equal, maintain original order
            if (countA === countB) {
                if (a.databaseId === 1484) return -1;
                if (b.databaseId === 1484) return 1;
                if (a.databaseId === 1483) return -1;
                if (b.databaseId === 1483) return 1;
                if (a.databaseId === 1485) return -1;
                if (b.databaseId === 1485) return 1;
                return 0;
            }

            return countB - countA;
        });

        return sortedCategories;
    }, [firstCategoryFacets, categories]);

    const totalCount = useMemo(() => {
        return firstCategoryFacets.reduce((acc, f) => {
            const count = f.count || 0;
            return acc + count;
        }, 0)
    }, [firstCategoryFacets]);

    return (
        <div className="overflow-hidden relative w-full z-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <div className="relative flex flex-col px-4 py-4 w-full space-y-5">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="font-medium flex gap-2 items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                >
                    <span>Categories</span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>

                <Transition
                    show={!isCollapsed}
                    enter="transition-all duration-300 ease-out"
                    enterFrom="opacity-0 max-h-0"
                    enterTo="opacity-100 max-h-[1000px]"
                    leave="transition-all duration-300 ease-in"
                    leaveFrom="opacity-100 max-h-[1000px]"
                    leaveTo="opacity-0 max-h-0"
                >
                    <div className="space-y-5">
                        <Checkbox
                            name="All Categories"
                            label={`All Categories (${totalCount})`}
                            defaultChecked={catState.length === 0}
                            onChange={(checked) =>
                                handleChangeCategories(checked, 0)
                            }
                        />

                        <div className="w-full border-b  border-neutral-200 dark:border-neutral-700" />

                        {facetedCategories.length > 0 ?
                            <div className="relative">
                                <div className='grid grid-cols-1 gap-2'>
                                    {(showAllCategories ? facetedCategories : facetedCategories.slice(0, 10)).map((item) => (
                                        <div key={item.databaseId} className="">
                                            <Checkbox
                                                name={item.slug || ''}
                                                label={`${item.name} (${firstCategoryFacets.find(f => item.databaseId === Number(f.value))?.count || 0})`}
                                                defaultChecked={catState.includes(item.databaseId)}
                                                onChange={(checked) =>
                                                    handleChangeCategories(checked, item.databaseId)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                {facetedCategories.length > 10 && !showAllCategories && (
                                    <>
                                        {/* Gradient overlay */}
                                        <div className="absolute bottom-8 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none z-10" />

                                        {/* Show More button */}
                                        <div className="mt-2 text-center relative z-20">
                                            <button
                                                onClick={() => setShowAllCategories(true)}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                            >
                                                Show More ({facetedCategories.length - 10} more)
                                            </button>
                                        </div>
                                    </>
                                )}

                                {facetedCategories.length > 10 && showAllCategories && (
                                    <div className="mt-2 text-center">
                                        <button
                                            onClick={() => setShowAllCategories(false)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                        >
                                            Show Less
                                        </button>
                                    </div>
                                )}
                            </div> :
                            <div className='text-sm'>No Categories found for this search.</div>
                        }
                    </div>
                </Transition>
            </div>
        </div>
    );
}

export default CategoryFilter