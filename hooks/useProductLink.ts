import {Brand, Product, TermNode} from "@/graphql/types/graphql";
import {useEffect, useState} from "react";


const useProductLink = (product?: Product | null) => {

    const [link, setLink] = useState('')

    useEffect(() => {

        if (!product) {
            return;
        }

        const productBrand = product?.terms?.nodes.find((term: Brand) => term.__typename === 'Brand') || {
            name: 'Product',
            slug: 'product'
        };

        setLink(`/${productBrand.slug}/${product.slug}`)
    }, [product])

    return link
}

export default useProductLink