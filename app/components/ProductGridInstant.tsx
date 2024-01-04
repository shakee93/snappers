"use client"
import {Brand, Category, Product} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {useEffect, useState} from "react";
import {GET_BRAND_ARCHIVE} from "@/graphql/defs/products";
import {useLazyQuery} from "@apollo/client";
import ProductCard from "./ProductCard3";
import {useHits, useInstantSearch} from "react-instantsearch";
import Pagination from "@/shared/Pagination/Pagination";
import Image from "next/image";

import NotFound from '@/public/not_found.svg'
import {usePathname} from "next/navigation";

interface ProductGridProps {
    products?: { node: Product }[]
    brand?: Brand
    category?: Category
}
const ProductGridInstant = ({ products, brand, category }: ProductGridProps) => {
    const { hits, results } = useHits()

    const { status: statusState } = useInstantSearch();
    const { setSearchStatus, search, navigation } = useStore()

    const grid = 8;

    useEffect(() => {
        setSearchStatus(statusState)
    }, [statusState])

    // if ((search.length > 0 || navigation.length > 1) && (statusState === 'stalled' ) ) {
    //     return <div className='flex-1 grid  grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-5 lg:gap-x-8 lg:gap-y-10'>
    //         {Array(grid).fill(null).map((x, index) =>
    //             <div key={index} className="space-y-3">
    //                 <div className="h-52 bg-gray-200 rounded-md animate-pulse"></div>
    //                 <div className="h-4 bg-gray-300 rounded-md"></div>
    //                 <div className="h-4 bg-gray-300 rounded-md w-2/3"></div>
    //                 <div className="h-8 bg-gray-300 rounded-md w-1/4"></div>
    //             </div>
    //         )}
    //     </div>
    // }

    return (
        <>
            {(results?.nbHits === 0 && statusState === 'idle') && <div className='text-center text-slate-500 flex flex-col items-center gap-20 py-12'>
                <div>
                    <Image className='w-64' src={NotFound} alt='No Search Results'/>
                </div>
                <div>
                    We couldn&lsquo;t find any products :(
                </div>
            </div>}

            <div className="flex-1 grid  grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-5 lg:gap-x-8 lg:gap-y-10">
                {hits.map((item, index: number) =>
                    // <div key={index}></div>
                    <ProductCard  key={item.slug as unknown as string} data={item as unknown as Product} />
                )}
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
