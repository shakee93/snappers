"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import CategoryFilter from "@/app/components/Filters/CategoryFilter";
import BrandFilter from "@/app/components/Filters/BrandFilter";
import PriceFilter from "@/app/components/Filters/PriceFilter";
import OnSaleFilter from "@/app/components/Filters/OnSaleFilter";
import SortOrderFilter from "@/app/components/Filters/SortOrderFilter";
import InStockFilter from "./Filters/InStockFilter";

interface TabFilterProps {
    categories?: ProductCategory[];
    category?: ProductCategory;
    brands?: Brand[];
    brand?: Brand;
    sort?: Boolean;
}


const TabFilters = ({
    categories = [],
    brands = [],
    brand,
    category,
    sort,
}: TabFilterProps) => {

    const {
        setMounted,
    } = useStore();


    useEffect(() => {
        setMounted();
    }, []);

    // console.log('sortsss', sort);

    return (
        <div className="flex flex-col gap-0 lg:gap-3 lg:space-x-4">
            <div className="hidden lg:flex flex-col justify-start items-start flex-1 space-y-3">
                {!category && <CategoryFilter categories={categories} />}
                <InStockFilter/>
                {!brand && <BrandFilter brands={brands} />}
                <PriceFilter />
                <OnSaleFilter />
                <SortOrderFilter sorts={sort} />
            </div>
        </div>
    );
};

export default TabFilters;
