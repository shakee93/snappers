"use client"
import {Product} from "@/lib/graphql/types/graphql";
import Image from "next/image";
import {useStore} from "@/store/store";
import {useEffect, useState} from "react";
import {GET_ALL_PRODUCTS} from "@/lib/graphql/products";
import {useQuery} from "@apollo/client";


const ProductGrid = ({ products }: {
    products: {
        node: Product
    }[]
}) => {

    const { sidebar: { categories }} = useStore()
    const [_products, setProducts] = useState(null)
    let { loading, error, data, refetch} = useQuery(  GET_ALL_PRODUCTS, {
        variables:   {
            categoryIdIn: categories
        }
    });
    
    useEffect(() => {
        refetch()
    }, [categories])

    useEffect(() => {

        if(data?.products.edges.length > 0) {
            setProducts(data.products.edges)
        }

    }, [data])

    return loading ? <div>loading...</div> : <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10 " >

        {(_products ? _products : products).map((item, index: number) => (
            <div key={item.node.slug}>
                {item.node.name} <br/>
                {/*{JSON.stringify(item.node.image?.mediaItemUrl)} */}
                <br/>
                <Image width={300} height={300} src={item.node.image?.mediaItemUrl || ''}
                       alt={item.node.name || ''}/>
            </div>
        ))}
    </div>;
}

export default ProductGrid