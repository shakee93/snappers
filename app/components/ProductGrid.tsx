"use client"
import { Brand, Category, Product } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import { GET_BRAND_ARCHIVE } from "@/graphql/defs/products";
import { useLazyQuery } from "@apollo/client";
import ProductCard from "./ProductCard3";

interface ProductGridProps {
    products: { node: Product }[]
    brand?: Brand
    category?: Category
}

const ProductGrid = ({ products, brand, category }: ProductGridProps) => {
    const HIDDEN_PRODUCT_SLUGS = new Set(["demo"]);

    const { sidebar: { categories, brands, mounted } } = useStore();
    const [_products, setProducts] = useState<{ node: Product }[]>(products);
    const [mounts, setMounts] = useState(0)

    let [getArchiveData, { loading, error }] = useLazyQuery(GET_BRAND_ARCHIVE, {
        fetchPolicy: 'no-cache'
    });

    useEffect(() => {



        if (categories.length === 0 && brands.length === 0 && mounted) {
            setMounts(p => p + 1)
        }


        if (mounts >= 0) {
            (async () => {
                let { data } = await getArchiveData({
                    variables: {
                        categoryIdIn: category && categories.length === 0 && brands.length === 0 ? [category.databaseId] : categories,
                        brandId: brand && categories.length === 0 && brands.length === 0 ? [brand.databaseId] : brands
                    },
                    fetchPolicy: 'no-cache'
                });

                setProducts(data.products.edges)
            })();
        }


    }, [categories, brands]);


    return loading ? (
        <div>loading...</div>
    ) : (
        <div className="flex-1 grid  sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {_products
                .filter((item) => {
                    const slug = String(item?.node?.slug || "").toLowerCase();
                    return !HIDDEN_PRODUCT_SLUGS.has(slug);
                })
                .map((item) => <ProductCard key={item.node.slug} data={item.node} />)}
        </div>
    );
};

export default ProductGrid;
