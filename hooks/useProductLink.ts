import {Brand, Product, TermNode} from "@/graphql/types/graphql";
import {useEffect, useState} from "react";


const useProductLink = (product?: Product | null) => {

    const [link, setLink] = useState('')

    useEffect(() => {

        if (!product) {
            return;
        }

        const productBrand = product?.brands?.nodes[0] ||  {
            name: 'Product',
            slug: 'product'
        };

        setLink(`/${productBrand.slug}/${product.slug}`)
    }, [product])
    return link
}

export default useProductLink