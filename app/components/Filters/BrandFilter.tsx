import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import FilterPopover from "@/app/components/Filters/FilterPopover";
import { useRefinementList } from "react-instantsearch";
// import {RefinementListItem} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
// import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import { useParams } from "next/navigation";

interface BrandFilterProps {
  brands: Brand[];
}

const BrandFilter = ({ brands }: BrandFilterProps) => {
  const {
    syncBrands,
    search,
    sidebar: { brands: brandsState },
  } = useStore();
  const [firstFacets, setFirstFacets] = useState<any[]>([]);
  const { category } = useParams()

  const { items: brandsFacet, refine } = useRefinementList({
    attribute: 'brands_facet',
    limit: 13,
  });


  useEffect(() => {
    // Reset firstFacets on category change to avoid stale data
    if (brandsFacet.length > 0) {
      setFirstFacets([]); // Clear `firstFacets` momentarily
      setTimeout(() => {
        setFirstFacets(brandsFacet); // Set `firstFacets` with new `brandsFacet` after a short delay
      }, 0); // Adjust delay if necessary for smoother updates
    }
  }, [brandsFacet, category]);

  useEffect(() => {

    if (firstFacets.length === 0) {
      setFirstFacets(brandsFacet)
    }

  }, [brandsFacet, category])


  //TODO: bug - when a category is selected it will show up in search as well
  useEffect(() => {
    if (search.length === 0) {
    } else {
      setFirstFacets(brandsFacet);
    }
  }, [brandsFacet, search])


  const handleChange = useCallback((checked: boolean, name: number) => {
    if (name === 0 && checked) {
      syncBrands([]);
      return;
    }

    checked
      ? syncBrands([...brandsState, name])
      : syncBrands(brandsState.filter((i: any) => i !== name));

  }, [brandsState])

  const facetedBrands = useMemo(() => {
    return brands.filter(b =>
      firstFacets.map(f => Number(f.value)).includes(b.databaseId)
    );
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

        <span className='font-medium'>Brands</span>
        <Checkbox
          name="All Brands"
          label={`All Brands (${totalCount})`}
          defaultChecked={brandsState.length === 0}
          onChange={(checked) => handleChange(checked, 0)}
        />

        <div className="w-full border-b  border-neutral-200 dark:border-neutral-700" />

        {facetedBrands.length > 0 ?
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            {facetedBrands.map((item) => (
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
          </div> :
          <div className='text-sm'>No Brands found for this search.</div>
        }

      </div>
    </div>

  );
};

export default BrandFilter;
