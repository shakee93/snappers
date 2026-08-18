'use client'
import InstantSearchWrapper from "@/components/global/primitives/InstantSearchWrapper";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { Suspense, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ProductCardsSkeleton, INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME } from "@/components/global/primitives/Loading/ProductCardLoading";
import AttributeMappingsInitializer from "@/components/global/primitives/AttributeMappingsInitializer";

interface SearchBarProps {
    productCategories: ProductCategory[]
    brands: Brand[]
}


const HeaderSearchResults = ({ brands, productCategories }: SearchBarProps) => {

    const { search } = useStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const body = document.getElementsByTagName('body')[0] as HTMLBodyElement

        if (search.length > 0) {
            body.classList.add('overflow-hidden')
        } else {
            body.classList.remove('overflow-hidden')
        }

    }, [search])

    useEffect(() => {
        setMounted(true)
    }, [])


    if (!mounted) {
        return <></>
    }


    return search.length > 0 ? <div className={twMerge(
        `inset-0 py-4 px-0 md:pt-0 pb-[100px] md:p-10 mt-[60px] lg:mt-[70px] bg-zinc-100 z-[35] overflow-y-scroll overlay-class`,
        search.length > 0 ? 'fixed' : 'hidden'
    )}>
        <div className='container mx-auto'>
            <Suspense fallback={<ProductCardsSkeleton count={8} className={INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME} />}>
                <AttributeMappingsInitializer />
                <InstantSearchWrapper
                    filters
                    categories={productCategories}
                    brands={brands}
                    bindToStore={true}
                    server={false}
                    routing={true}
                    searchQueryValue={search}
                >
                </InstantSearchWrapper>
            </Suspense>
        </div>
    </div> : <></>;
}

export default HeaderSearchResults