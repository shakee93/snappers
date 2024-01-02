'use client'
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
    Attribute,
    Brand,
    Category, GlobalProductAttribute, PaCapacity,
    Product,
    ProductAttribute, ProductUnion, ProductVariation,
    SimpleProduct,
    VariableProduct, VariationAttribute
} from "@/graphql/types/graphql";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useStore} from "@/store/store";
import {twMerge} from "tailwind-merge";

const ProductDetails = ({
    product, brand
}: {
    product: VariableProduct & SimpleProduct
    brand: Brand
}) => {

    const { product : { attribute }, setAttribute } = useStore()
    const [activeVariation, setActiveVariation] = useState<any>(!!product?.variations?.nodes?.length ? product?.variations?.nodes[0] : null)
    const [activeOption, setActiveOption] = useState(
        !!product?.variations?.nodes?.length ? product?.variations?.nodes[0].attributes?.nodes[0].value : null
    )


    useEffect(() => {

        if (product.type === 'VARIABLE') {

            const defAttributes = product?.defaultAttributes?.nodes;

            product?.attributes?.nodes.map((attr: ProductAttribute) => {
                setAttribute(attr, attr?.options && attr?.options[0] || '')
            })

            defAttributes?.forEach((defAttr: VariationAttribute) => {
                setAttribute(defAttr, defAttr.value || '')
            })
        }

    }, []);


    const activeAttr = useCallback((attr: ProductAttribute) => {
        return attribute.find(a => a.name === attr.name)
    }, [attribute])

    useEffect(() => {


        if (product.type === 'VARIABLE') {

            let variation = (product as VariableProduct).variations?.nodes as unknown as ProductVariation[];

            let vProduct = variation.find(v => {

                let nodes = v.attributes?.nodes as unknown as VariationAttribute[];

                let attrKey = attribute.map(a => `${a.name}:${a.val}`).join('+');
                let variationKey = nodes?.map(a => `${a.name}:${a.value}`).join('+')

                return attrKey === variationKey
            });


            if (vProduct) {
                setActiveVariation(vProduct);
            } else {
                setActiveVariation(null)
            } 
        }

        

    }, [attribute])

    return (
        <>
            <div className="flex gap-1  text-sm text-gray-500">
                Brand : <span className="">{brand?.name}</span>
            </div>

            <div className="text-base md:text-lg font-medium ">
                {product.name} - {product.databaseId}
            </div>


            {product.type === 'VARIABLE' &&
                <>
                    {product.attributes?.nodes.map((attr : ProductAttribute, index: number) =>
                        <div key={index} className="py-2 text-gray-500">
                            <div className="text-sm py-2">{attr.label}: <span className='font-medium text-gray-700'>{(product as unknown as VariableProduct)[`allPa${attr?.label as unknown as 'Capacity'}`]?.nodes.find((node: PaCapacity) => node.slug === activeAttr(attr)?.val)?.name}</span> </div>

                            <ul className="flex gap-2 flex-wrap text-sm items-center">

                                {attr.options?.map((option, index) =>
                                    <li key={index}
                                        onClick={e => setAttribute(attr, option || '')}
                                        className={
                                        twMerge(
                                            "border bg-gray-200/80 cursor-pointer text-black inline-block py-2 px-3.5  text-xs md:text-sm rounded",
                                            activeAttr(attr)?.val === option && ' border-blue-700 bg-white'
                                        )
                                    }>
                                        {(product as unknown as VariableProduct)[`allPa${attr?.label as unknown as 'Capacity'}`]?.nodes.find((node: PaCapacity) => node.slug === option)?.name || 'Option'}
                                    </li>
                                )}

                            </ul>
                        </div>
                    )}

                </>
            }


            {product.type === 'VARIABLE' && activeVariation ? <div>
                    <div className="flex gap-4 text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
                <span>
                {activeVariation.price}
                </span>

                        {(!!activeVariation.salePrice && activeVariation.salePrice !== activeVariation.regularPrice) &&
                            <span className="text-red-400">
                        <s>{activeVariation.regularPrice}</s>
                    </span>
                        }

                    </div>
                </div> :
                <div className="flex gap-2 text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
                <span>
                {product.price}
                </span>

                    {(!!product.salePrice && product.salePrice !== product.regularPrice) &&
                        <span className="text-red-400">
                        <s>{product.regularPrice}</s>
                    </span>
                    }

                </div>
            }

            {(product.type === 'SIMPLE' && product.stockStatus !== 'IN_STOCK') &&
                <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
                    Sold Out
                </div>
            }

            {product.type === 'VARIABLE' && activeVariation?.stockStatus !== 'IN_STOCK' &&
                <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
                    Sold Out
                </div>
            }

            <ProductAddToCart product={product} variation={activeVariation} />
            <div className="flex gap-1 items-center text-sm md:text-base text-gray-500">
                <div className="text-sm py-2">Category:</div>
                {product.productCategories?.edges.map((category: any, index: number) =>
                    <Link href={`/collections/${category.node.slug}`} key={index} className="bg-primary-100 inline-block py-1 px-2  text-xs md:text-sm rounded-3xl">
                        {category.node.name}
                    </Link>
                )}

            </div>
        </>
    );
};

export default ProductDetails;
