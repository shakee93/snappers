import {LineItem, PaCapacity, SimpleProduct, VariableProduct,} from "@/graphql/types/graphql";
import Image from "next/image";
import Link from "next/link";
import { isLineItemFree, stripHtmlMoney } from "@/lib/cartLinePricing";
import { currencySymbol } from "@/lib/formatPrice";
import useProductLink from "@/hooks/useProductLink";
import React, {Fragment} from "react";
import AttributeIcon from "@/components/primitives/AttributeIcon";

const OrderItemProduct = ({
                              orderItem,
                              index,
                          }: {
    orderItem: LineItem;
    index: number;
}) => {
    // console.log("order item", orderItem);

    const link = useProductLink(orderItem.product?.node);

    const { variation, total, subtotal } = orderItem;
    // console.log("orderItem", orderItem);
    if (!orderItem.product?.node) {
        // console.log("orderItem.product?.node: ", orderItem);
        return <></>;
    }


    const {
        name,
        image,
        price,
        slug,
        salePrice,
        type,
        stockQuantity,
        regularPrice,
        featuredImage,
    }: VariableProduct & SimpleProduct = orderItem?.product?.node;
    // console.log({variation})
    let a = "";

    return (
        <div className="relative flex py-8 sm:py-10 xl:py-12 first:pt-0 last:pb-0">
            <div className="relative h-36 w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image
                    fill
                    style={{objectFit: "cover"}}
                    src={featuredImage?.node?.sourceUrl || ""}
                    alt={name || ""}
                    className="h-full w-full object-contain object-center"
                />
                <Link href={`${link}`} className="absolute inset-0"></Link>
            </div>

            <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
                <div>
                    <div className="flex justify-between ">
                        <div className="flex-[1.5] ">
                            <h3 className="text-base font-semibold">
                                <Link href={`${link}`}>{name}</Link>
                            </h3>

                            {type === "VARIABLE" && (
                                <div className="mt-1.5 sm:mt-2.5 flex text-sm text-slate-600 dark:text-slate-300">
                                    {type === "VARIABLE" && (
                                        <div className="my-1 text-sm text-slate-500 dark:text-slate-400">
                                            {variation?.node?.attributes &&
                                                [variation.node.attributes].map(
                                                    (attr: any, index: any) => (
                                                        <Fragment key={index}>
                                                            <div className="flex items-center gap-1">
                                                                <AttributeIcon
                                                                    name={attr?.name || ""}
                                                                    className="w-4"
                                                                />{" "}
                                                                <span key={attr?.value}>
                                  {" "}
                                                                    {
                                                                        (
                                                                            orderItem?.product
                                                                                ?.node as unknown as VariableProduct
                                                                        )[
                                                                            `allPa${
                                                                                attr?.label as unknown as "Capacity"
                                                                            }`
                                                                            ]?.nodes.find(
                                                                            (node: PaCapacity) =>
                                                                                node.slug === attr?.value
                                                                        )?.name
                                                                    }
                                </span>
                                                            </div>
                                                        </Fragment>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div
                                className={`flex items-center mt-2 border-2 w-fit border-gray-300 rounded-lg p-2 `}
                            >
                                <span className="text-slate-950 text-xs lg:text-sm font-bold !leading-none">
                                    {isLineItemFree(total, subtotal) ? (
                                        <span className="text-green-600">Free</span>
                                    ) : (
                                        <>{currencySymbol}.{stripHtmlMoney(total ?? subtotal)}</>
                                    )}
                                </span>
                            </div>

                            <div className="mt-3 flex justify-between w-full sm:hidden relative">
                                <span className="py-1 px-2 text-sm font-medium text-slate-950">
                                    {isLineItemFree(total, subtotal) ? (
                                        <span className="font-bold text-green-600">Free</span>
                                    ) : (
                                        <>{currencySymbol}.{stripHtmlMoney(total ?? subtotal)}</>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="hidden flex-1 sm:flex justify-end">
                            <div className="mt-0.5 flex flex-col items-end">
                                {isLineItemFree(total, subtotal) ? (
                                    <span className="text-base font-bold text-green-600">
                                        Free
                                    </span>
                                ) : (
                                    <span className="text-base font-bold text-slate-950">
                                        {currencySymbol}.{stripHtmlMoney(total ?? subtotal)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex mt-auto pt-4 items-end justify-between text-sm">
                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default OrderItemProduct;
