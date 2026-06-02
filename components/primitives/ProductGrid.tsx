"use client"
import { Brand, Category, Product } from "@/graphql/types/graphql";
import { filterHiddenProducts } from "@/lib/hidden-products";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useBrandArchive } from "@/hooks/useBrandArchive";
import ProductCard from "@/components/ui/ProductCard3";

interface ProductGridProps {
    products: { node: Product }[]
    brand?: Brand
    category?: Category
}

const ProductGrid = ({ products, brand, category }: ProductGridProps) => {
    const { sidebar: { categories, brands, mounted } } = useStore();
    const [_products, setProducts] = useState<{ node: Product }[]>(products);
    const [mounts, setMounts] = useState(0)

    let [getArchiveData, { loading, error }] = useBrandArchive();

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
            {filterHiddenProducts(_products.map(i => i.node))
                .map((node) => <ProductCard key={node.slug} data={node} />)}
        </div>
    );
};

export default ProductGrid;
