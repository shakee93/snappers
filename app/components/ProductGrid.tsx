"use client"
import {Product} from "@/graphql/types/graphql";
import Image from "next/image";
import {useStore} from "@/store/store";
import {useEffect, useState} from "react";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import {useQuery} from "@apollo/client";
import Link from "next/link";
import ProductCard, { ProductCardProps } from "./ProductCard3";

const ProductGrid = ({ products }: { products: { node: Product }[] }) => {
    const { sidebar: { categories } } = useStore();
    const [_products, setProducts] = useState(products);
    let { loading, error, data, refetch } = useQuery(GET_ALL_PRODUCTS, {
        skip: true,
        variables: {
            categoryIdIn: categories,
        },
    });


    useEffect(() => {
        refetch();
    }, [categories]);

    useEffect(() => {
        if (data?.products.edges.length > 0) {
            setProducts(data.products.edges);
        }
    }, [data]);


    // console.log({ data });


    useEffect(() => {
        console.log(_products);
    }, [])


    return loading ? (
        <div>loading...</div>
    ) : (
        <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
            {_products.map((item, index: number) => {
                return (
                    <ProductCard  key={item.node.slug} data={item.node} />
                );
            })}
        </div>
    );
};

export default ProductGrid;
