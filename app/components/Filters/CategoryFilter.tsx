import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import { useHits, useRefinementList } from "react-instantsearch";
// import {RefinementListItem} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import { useParams, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
    categories: ProductCategory[]
}

const CategoryFilter = ({ categories }: CategoryFilterProps) => {
    const { syncCategories, search, sidebar: { categories: catState } } = useStore()
    const [firstCategoryFacets, setFirstCategoryFacets] = useState<any[]>([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const { brand } = useParams()
    const { hits, results } = useHits();
    const searchParams = useSearchParams();

    const { items: categoriesFacet } = useRefinementList({
        attribute: 'categories_facet',
    });

    useEffect(() => {
        // Read from URL on mount
        const categoryIds = searchParams.get('categories');
        if (categoryIds) {
            const ids = categoryIds.split(',').map(id => parseInt(id));
            syncCategories(ids);
        }
    }, []);

    useEffect(() => {
        // Update URL when categories change
        const url = new URL(window.location.href);
        if (catState.length > 0) {
            url.searchParams.set('categories', catState.join(','));
        } else {
            url.searchParams.delete('categories');
        }
        window.history.replaceState({}, '', url.toString());
    }, [catState]);

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

            checked
                ? syncCategories([...catState, name])
                : syncCategories(catState.filter((i) => i !== name));
        }, [catState])

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
                <span className='font-medium flex gap-2 items-center'>Categories</span>
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
        </div>
    );
}

export default CategoryFilter