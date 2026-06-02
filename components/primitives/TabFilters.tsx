"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import CategoryFilter from "@/components/primitives/Filters/CategoryFilter";
import BrandFilter from "@/components/primitives/Filters/BrandFilter";
import PriceFilter from "@/components/primitives/Filters/PriceFilter";
import OnSaleFilter from "@/components/primitives/Filters/OnSaleFilter";
import SortOrderFilter from "@/components/primitives/Filters/SortOrderFilter";
import InStockFilter from "./Filters/InStockFilter";
import DynamicVariationFilters from "@/components/primitives/Filters/DynamicVariationFilters";
import DealsTypeFilter from "@/components/primitives/Filters/DealsTypeFilter";
import { DealFilterType } from "@/lib/dealFilters";

interface TabFilterProps {
    categories?: ProductCategory[];
    category?: ProductCategory;
    brands?: Brand[];
    brand?: Brand;
    sort?: Boolean;
    dealsType?: DealFilterType[];
    inStockOnly?: boolean;
}


const TabFilters = ({
    categories = [],
    brands = [],
    brand,
    category,
    sort,
    dealsType,
    inStockOnly = false,
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
