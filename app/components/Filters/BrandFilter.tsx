import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import { useRefinementList, useInstantSearch } from "react-instantsearch";
// import {RefinementListItem} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
// import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import { useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Transition } from "@headlessui/react";
import { UiState } from "instantsearch.js";

interface BrandFilterProps {
  brands: Brand[];
}

type MyUiState = UiState & {
  product: {
    brands: number[];
    query?: string;
  }
}

const BrandFilter = ({ brands }: BrandFilterProps) => {
  const {
    syncBrands,
    search,
    sidebar: { brands: brandsState },
  } = useStore();
  const [firstFacets, setFirstFacets] = useState<any[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { category } = useParams()
  const { uiState, setUiState } = useInstantSearch<MyUiState>();

  const { items: brandsFacet, refine } = useRefinementList({
    attribute: 'brands_facet',
    limit: 17,
  });

  // URL synchronization is now handled by InstantSearch routing
  // No need for manual URL manipulation

  useEffect(() => {
    // Reset firstFacets on category change to avoid stale data
    if (brandsFacet.length > 0) {
      setFirstFacets([]);
      setTimeout(() => {
        setFirstFacets(brandsFacet);
      }, 0);
    }
  }, [brandsFacet, category]);

  useEffect(() => {
    if (firstFacets.length === 0) {
      setFirstFacets(brandsFacet)
    }
  }, [brandsFacet, category])

  useEffect(() => {
    if (search.length === 0) {
    } else {
      setFirstFacets(brandsFacet);
    }
  }, [brandsFacet, search])

  const handleChange = useCallback((checked: boolean, name: number) => {
    if (name === 0 && checked) {
      syncBrands([]);
      setUiState(prev => {
        return {
          ...prev,
          product: {
            ...(prev.product || {}),
            brands: [],
            query: prev.product?.query || '',
          }
        }
      });
      return;
    }

    const newBrands = checked
      ? [...brandsState, name]
      : brandsState.filter((i: any) => i !== name);

    // Update UI state
    setUiState(prev => {
      return {
        ...prev,
        product: {
          ...(prev.product || {}),
          brands: newBrands,
          query: prev.product?.query || '',
        }
      }
    });

    syncBrands(newBrands);
  }, [brandsState, setUiState, syncBrands])

  const facetedBrands = useMemo(() => {
    const filteredBrands = brands

    // Sort by count from firstFacets (highest first)
    filteredBrands.sort((a, b) => {
      const countA = firstFacets.find(f => a.databaseId === Number(f.value))?.count || 0;
      const countB = firstFacets.find(f => b.databaseId === Number(f.value))?.count || 0;
      return countB - countA;
    });

    return filteredBrands;
  }, [brands, firstFacets]);

  const icon = (
    <svg
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
  );

  const totalCount = useMemo(() => {
    return firstFacets.reduce((acc, f) => {
      const count = f.count || 0;
      return acc + count;
    }, 0)
  }, [firstFacets]);

  useEffect(() => {
    // console.log("Faceted brands updated:", facetedBrands);
  }, [facetedBrands]);

  return (
    <div className="overflow-hidden rounded-2xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
      <div className="relative flex flex-col w-full px-5 py-4 pb-5 space-y-5">

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="font-medium flex gap-2 items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
        >
          <span>Brands</span>
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
              name="All Brands"
              label={`All Brands (${totalCount})`}
              defaultChecked={brandsState.length === 0}
              onChange={(checked) => handleChange(checked, 0)}
            />

            <div className="w-full border-b  border-neutral-200 dark:border-neutral-700" />

            {facetedBrands.length > 0 ?
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                  {(showAllBrands ? facetedBrands : facetedBrands.slice(0, 10)).map((item) => (
                    <div key={item.databaseId} className="">
                      <Checkbox
                        name={item.slug || ""}
                        //label={`${item.name} (${item.count})`}
                        label={`${item.name} (${firstFacets.find(f => item.databaseId === Number(f.value))?.count || 0})`}
                        defaultChecked={brandsState.includes(item.databaseId)}
                        onChange={(checked) =>
                          handleChange(checked, item.databaseId)
                        }
                      />
                    </div>
                  ))}
                </div>

                {facetedBrands.length > 10 && !showAllBrands && (
                  <>
                    {/* Gradient overlay */}
                    <div className="absolute bottom-8 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none z-10" />

                    {/* Show More button */}
                    <div className="mt-2 text-center relative z-20">
                      <button
                        onClick={() => setShowAllBrands(true)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Show More ({facetedBrands.length - 10} more)
                      </button>
                    </div>
                  </>
                )}

                {facetedBrands.length > 10 && showAllBrands && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setShowAllBrands(false)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Show Less
                    </button>
                  </div>
                )}
              </div> :
              <div className='text-sm'>No Brands found for this search.</div>
            }
          </div>
        </Transition>

      </div>
    </div>

  );
};

export default BrandFilter;
