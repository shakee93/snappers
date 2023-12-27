"use client"
import {Brand, Category, Product} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {useEffect, useState} from "react";
import {GET_BRAND_ARCHIVE} from "@/graphql/defs/products";
import {useLazyQuery} from "@apollo/client";
import ProductCard from "./ProductCard3";
import {useHits} from "react-instantsearch";
import Pagination from "@/shared/Pagination/Pagination";

interface ProductGridProps {
    products?: { node: Product }[]
    brand?: Brand
    category?: Category
}
const ProductGridInstant = ({ products, brand, category }: ProductGridProps) => {
    const { hits, results } = useHits()

    useEffect(() => {
        console.log(results);
    }, [hits])

    return (

        <div>
            <div className="flex-1 grid  sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {hits.map((item, index: number) =>
                    <ProductCard  key={item.slug as unknown as string} data={item as unknown as Product} />
                )}

            </div>

            <hr className="border-slate-200 my-8 dark:border-slate-700" />

            <Pagination />
        </div>

    );
};

export default ProductGridInstant;
