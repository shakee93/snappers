'use client'
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {useEffect} from "react";

interface SearchBarProps {
    productCategories : ProductCategory[]
    brands: Brand[]
}


const HeaderSearchResults = ({ brands, productCategories}: SearchBarProps) => {

    const { search } = useStore()

    useEffect(() => {
        const body = document.getElementsByTagName('body')[0] as HTMLBodyElement

        if (search.length > 0) {
            body.classList.add('overflow-hidden')
        } else {
            body.classList.remove('overflow-hidden')
        }

    }, [search])

    return search.length > 0 ? <div className='fixed inset-0 p-5 md:p-10 mt-[129px] bg-gray-100 z-[100] overflow-y-scroll'>
        <InstantSearchWrapper
            filters
            categories={productCategories}
            brands={brands}
        >
        </InstantSearchWrapper>
    </div> : <></>
}

export default HeaderSearchResults