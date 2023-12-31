"use client";
import Prices from "components/Prices";
import { PRODUCTS } from "data/data";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import Image from "next/image";
import { useQuery } from "@apollo/client"; // Import useQuery from Apollo Client
import { GET_ALL_ORDER_DETAILS } from "@/graphql/defs/order";
import { useEffect } from "react";
import CartItemProduct from "@/app/containers/ProductDetailPage/CartItem";
import { CartItem, SimpleProduct } from "@/graphql/types/graphql";
import OrderItemProduct from "@/app/containers/ProductDetailPage/OrderItem";

const AccountOrder = () => {
    // Use useQuery to fetch data
    const { loading, error, data } = useQuery(GET_ALL_ORDER_DETAILS);

    useEffect(() => {
        console.log("incomign order data", data);
    }, [data]);

    // const renderProductItem = (product: any, index: number) => {
    //     let imageSrc = product?.featuredImage?.node?.sourceUrl || "";
    //     let name = product?.title || "not title";
    //     return (
    //         <div key={index} className="flex py-4 sm:py-7 last:pb-0 first:pt-0">
    //             <div className="h-24 w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">

    //                 <Image
    //                     src={imageSrc}
    //                     alt={name}
    //                     width={0}
    //                     height={0}
    //                     sizes="100vw"
    //                     className="object-cover w-full h-full object-center"
    //                 />
    //             </div>

    //             <div className="ml-4 flex flex-1 flex-col">
    //                 <div>
    //                     <div className="flex justify-between ">
    //                         <div>
    //                             <h3 className="text-base font-medium line-clamp-1">{name}</h3>
    //                             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
    //                                 <span>{"Natural"}</span>
    //                                 <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
    //                                 <span>{"XL"}</span>
    //                             </p>
    //                         </div>
    //                         <Prices className="mt-0.5 ml-2" />
    //                     </div>
    //                 </div>
    //                 <div className="flex flex-1 items-end justify-between text-sm">
    //                     <p className="text-gray-500 dark:text-slate-400 flex items-center">
    //                         <span className="hidden sm:inline-block">Qty</span>
    //                         <span className="inline-block sm:hidden">x</span>
    //                         <span className="ml-2">1</span>
    //                     </p>

    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    const renderProductItem = (product: any, index: number) => {
        return (
            <>
                <OrderItemProduct orderItem={product} index={index} />
            </>
        )

    }


    const renderOrder = () => {
        // Check if data is loading or if there is an error
        if (loading) {
            return <p>Loading...</p>;
        }

        if (error) {
            return <p>Error: {error.message}</p>;
        }

        // Map over the orders from the GraphQL query
        return data.orders.edges.map((order: any, index: any) => {
            return (
                <div
                    key={index}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-0"
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-500/5">
                        <div>
                            <p className="text-lg font-semibold">#{order.node.orderNumber}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 sm:mt-2">
                                <span>{order.node.date}</span>
                                <span className="mx-2">·</span>
                                <span className="text-primary-500">Delivered</span>
                            </p>
                        </div>
                        <div className="mt-3 sm:mt-0">
                            <ButtonSecondary
                                sizeClass="py-2.5 px-4 sm:px-6"
                                fontSize="text-sm font-medium"
                            >
                                View Order
                            </ButtonSecondary>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8 divide-y divide-y-slate-200 dark:divide-slate-700">
                        {order.node.lineItems.nodes.map((lineItem: any, index: any) => {
                            const product = lineItem.product;

                            return renderProductItem(product, index);
                        })}
                    </div>
                </div>
            );
        });
    };

    // Check if there are no orders
    if (!data?.orders?.edges?.length) {
        return <p>No orders found.</p>;
    }
    return (
        <div>
            <div className="space-y-10 sm:space-y-12">
                {/* HEADING */}
                <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
                {renderOrder()}
            </div>
        </div>
    );
};

export default AccountOrder;
