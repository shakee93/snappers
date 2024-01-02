"use client"
import {Brand, Category, Product} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {useEffect, useState} from "react";
import {GET_BRAND_ARCHIVE} from "@/graphql/defs/products";
import {useLazyQuery} from "@apollo/client";
import ProductCard from "./ProductCard3";
import {useHits, useInstantSearch} from "react-instantsearch";
import Pagination from "@/shared/Pagination/Pagination";

interface ProductGridProps {
    products?: { node: Product }[]
    brand?: Brand
    category?: Category
}
const ProductGridInstant = ({ products, brand, category }: ProductGridProps) => {
    const { hits, results } = useHits()
    const [_status, setStatus] = useState('')
    // const { status: statusState } = useInstantSearch();
    // useEffect(() => {
    //     setStatus(statusState)
    // }, [statusState])

    const status = 'x'

    const grid = 8;

    return (
        <>
            <div className="flex-1 grid  grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-5 lg:gap-x-8 lg:gap-y-10">

                {['loading'].includes(_status)  ?
                     <>
                         {Array(grid).fill(null).map((x, index) =>
                             <div key={index} className="space-y-3">
                                 <div className="h-52 bg-gray-200 rounded-md animate-pulse"></div>
                                 <div className="h-4 bg-gray-300 rounded-md"></div>
                                 <div className="h-4 bg-gray-300 rounded-md w-2/3"></div>
                                 <div className="h-8 bg-gray-300 rounded-md w-1/4"></div>
                             </div>
                         )}
                     </>: <>
                        {hits.map((item, index: number) =>
                            <ProductCard  key={item.slug as unknown as string} data={item as unknown as Product} />
                        )}
                    </>
                }


            </div>


            {(results && results?.nbHits > results?.hitsPerPage ) &&
                <>
                    <hr className="border-slate-200 my-8 dark:border-slate-700" />
                    <Pagination />
                </>
            }

        </>

    );
};

export default ProductGridInstant;
