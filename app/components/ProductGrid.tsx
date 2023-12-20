"use client"
import {Product} from "@/graphql/defs/types/graphql";
import Image from "next/image";
import {useStore} from "@/store/store";
import {useEffect, useState} from "react";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import {useQuery} from "@apollo/client";
import Link from "next/link";
import { useStore } from "@/store/store";
import { useQuery } from "@apollo/client";
import { GET_ALL_PRODUCTS } from "@/lib/graphql/products";
import { Product } from "@/lib/graphql/types/graphql";
import ProductCard, { ProductCardProps } from "./ProductCard3";

const ProductGrid = ({ products }: { products: { node: Product }[] }) => {
    const { sidebar: { categories } } = useStore();
    const [_products, setProducts] = useState(null);
    let { loading, error, data, refetch } = useQuery(GET_ALL_PRODUCTS, {
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

    console.log({ data });
    console.log({ error });

    return loading ? (
        <div>loading...</div>
    ) : (
        <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
            {(_products ? _products : products).map((item, index: number) => {
                console.log("item", item.node);
                return (
                    <Link href={`/product/${item.node.slug}`} key={item.node.slug}>
                        <ProductCard data={item.node} />
                    </Link>
                );
            })}
        </div>
    );
};

export default ProductGrid;
