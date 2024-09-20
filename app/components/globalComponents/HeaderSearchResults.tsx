'use client'
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {Suspense, useEffect, useState} from "react";
import {twMerge} from "tailwind-merge";

interface SearchBarProps {
    productCategories : ProductCategory[]
    brands: Brand[]
}


const HeaderSearchResults = ({ brands, productCategories}: SearchBarProps) => {

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
        `inset-0 py-4 px-0 md:pt-0 pb-[100px] md:p-10 mt-[60px] lg:mt-[70px] bg-zinc-100 z-[15] overflow-y-scroll`,
        search.length > 0 ? 'fixed' : 'hidden'
    )}>
        <div className='container mx-auto'>
            <Suspense fallback={'loading...'}>
                <InstantSearchWrapper
                    filters
                    categories={productCategories}
                    brands={brands}
                    bindToStore={true}
                    server={false}
                >
                </InstantSearchWrapper>
            </Suspense>
        </div>
    </div> : <></>;
}

export default HeaderSearchResults