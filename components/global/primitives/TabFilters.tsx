"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import CategoryFilter from "@/components/global/primitives/Filters/CategoryFilter";
import BrandFilter from "@/components/global/primitives/Filters/BrandFilter";
import PriceFilter from "@/components/global/primitives/Filters/PriceFilter";
import OnSaleFilter from "@/components/global/primitives/Filters/OnSaleFilter";
import SortOrderFilter from "@/components/global/primitives/Filters/SortOrderFilter";
import InStockFilter from "./Filters/InStockFilter";
import DynamicVariationFilters from "@/components/global/primitives/Filters/DynamicVariationFilters";
import DealsTypeFilter from "@/components/global/primitives/Filters/DealsTypeFilter";
import FilterResetButton from "@/components/global/primitives/Filters/FilterResetButton";
import { DealFilterType } from "@/lib/dealFilters";

interface TabFilterProps {
    categories?: ProductCategory[];
    category?: ProductCategory;
    brands?: Brand[];
    brand?: Brand;
    sort?: Boolean;
    dealsType?: DealFilterType[];
    inStockOnly?: boolean;
    defaultSort?: string;
    resetSearchQuery?: boolean;
}


const TabFilters = ({
    categories = [],
    brands = [],
    brand,
    category,
    sort,
    dealsType,
    inStockOnly = false,
    defaultSort = "",
    resetSearchQuery = false,
}: TabFilterProps) => {

    const {
        setMounted,
    } = useStore();


    useEffect(() => {
        setMounted();
    }, []);


    return (
        <div className="flex flex-col gap-0 lg:gap-3 lg:space-x-4">
            <div className="hidden lg:flex flex-col justify-start items-start flex-1 space-y-3">
                <div className="flex w-full items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="text-sm font-semibold text-neutral-900">Filters</span>
                    <FilterResetButton
                        defaultSort={defaultSort}
                        resetDealsFilter={!!dealsType}
                        ignoreInStock={inStockOnly}
                        resetSearchQuery={resetSearchQuery}
                    />
                </div>
                {!inStockOnly && <InStockFilter />}
                <OnSaleFilter />
                <SortOrderFilter sorts={sort} />
                {dealsType ? <DealsTypeFilter activeTypes={dealsType} /> : null}
                {!category && <CategoryFilter categories={categories} />}
                {!brand && <BrandFilter brands={brands} />}
                <PriceFilter />
                <DynamicVariationFilters />
            </div>
        </div>
    );
};

export default TabFilters;
