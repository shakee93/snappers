'use client'
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
    Attribute,
    Brand,
    Category,
    Product,
    ProductAttribute, ProductUnion, ProductVariation,
    SimpleProduct,
    VariableProduct
} from "@/graphql/types/graphql";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useStore} from "@/store/store";
import {twMerge} from "tailwind-merge";

const ProductDetails = ({
    product, brand
}: {
    product: VariableProduct | SimpleProduct
    brand: Brand
}) => {

    const { product : { attribute }, setAttribute } = useStore()
    const [activeVariation, setActiveVariation] = useState<any>(product?.variations?.nodes.length > 0 ? product?.variations?.nodes[0] : null)


    useEffect(() => {

        product.attributes?.nodes.map((attr: ProductAttribute) => {
            setAttribute(attr, attr?.options[0] || '')
        })

    }, [])


    const activeAttr = useCallback((attr: ProductAttribute) => {
        return attribute.find(a => a.attr.name === attr.name)
    }, [attribute])

    useEffect(() => {

        if (product.type !== 'VARIABLE') {
            return
        }

        let variation = product?.variations?.nodes as unknown as ProductVariation[];

        let vProduct = variation.find(v => {

            let node = v.attributes?.nodes;
            
            return node?.find(n => attribute.find(attr => attr.option === n.value))
        });


        if (vProduct) {
            setActiveVariation(vProduct);
        }

    }, [attribute])

    return (
        <>
            {/*<div className="bg-orange-500 flex w-28 p-1 rounded-3xl text-white items-center justify-center gap-1 text-xs">*/}
            {/*    Best Seller <MousePointerClick className="text-white" size={14} />*/}
            {/*</div>*/}

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
                            <div className="text-sm py-2">{attr.label}:</div>

                            <ul className="flex gap-2 flex-wrap text-sm items-center">

                                {attr.options?.map((option, index) =>
                                    <li key={index}
                                        onClick={e => setAttribute(attr, option)}
                                        className={
                                        twMerge(
                                            "border bg-gray-200/80 cursor-pointer text-black inline-block py-2 px-3.5  text-xs md:text-sm rounded",
                                            activeAttr(attr)?.option === option && ' border-blue-700 bg-white'
                                        )
                                    }>
                                        {product[`allPa${attr.label}`]?.nodes.find(node => node.slug === option)?.name || 'Option'}
                                    </li>
                                )}

                            </ul>
                        </div>
                    )}
                </>
            }


            {(product.stockStatus === 'IN_STOCK' || activeVariation?.stockStatus === 'IN_STOCK') ?
                // <div className="w-max px-4 bg-green-300  text-center rounded-full  text-gray-700 text-xs md:text-sm py-1">
                //   In Stock
                // </div> :
                <div></div> :
                <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-500 text-xs md:text-sm py-1">
                    Out of Stock
                </div>
            }

            {activeVariation ? <div>
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
                <div className="flex flex-col text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
                <span>
                {product.regularPrice}
                </span>

                    {(!!product.salePrice && product.salePrice !== product.regularPrice) &&
                        <span className="text-red-400">
                        <s>{product.salePrice}</s>
                    </span>
                    }

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
