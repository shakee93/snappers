"use client";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import ButtonSecondary from "shared/Button/ButtonSecondary";
import { GET_ALL_ORDER_DETAILS } from "@/graphql/defs/order";
import OrderItemProduct from "@/app/containers/ProductDetailPage/OrderItem";
import LoadingSkeleton from "@/components/OrderPageSkeleton";

const AccountOrder = () => {
    const { loading, error, data } = useQuery(GET_ALL_ORDER_DETAILS);

    if (error) return <p>Error: {error.message}</p>;
    if (loading) return <LoadingSkeleton />;

    const hasOrders = data?.orders?.edges?.length > 0;

    return (
        <div className="space-y-10 sm:space-y-12">
            <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
            {hasOrders ? data.orders.edges.map((order: any, index:any) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-0">
                    <OrderHeader order={order.node} />
                    <OrderItems lineItems={order.node.lineItems.nodes} />
                </div>
            )) : <p>No orders found.</p>}
        </div>
    );
};

const OrderHeader = ({ order }: any) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-500/5">
        <div>
            <p className="text-lg font-semibold">#{order.orderNumber}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 sm:mt-2">
                <span>{order.date}</span>
                <span className="mx-2">·</span>
                <span className="text-primary-500">Delivered</span>
            </p>
        </div>
        <ButtonSecondary sizeClass="py-2.5 px-4 sm:px-6" fontSize="text-sm font-medium">View Order</ButtonSecondary>
    </div>
);

const OrderItems = ({ lineItems }: any) => (
    <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8 divide-y divide-y-slate-200 dark:divide-slate-700">
        {lineItems.map((item: any, index: any) => <OrderItemProduct index={index} orderItem={item.product} />)}
    </div>
);

export default AccountOrder;
