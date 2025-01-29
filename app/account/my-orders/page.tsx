"use client";
import { useQuery } from "@apollo/client";
import { GET_MY_ORDERS } from "@/graphql/defs/order";
import OrderItemProduct from "@/app/containers/ProductDetailPage/OrderItem";
import LoadingSkeleton from "@/components/OrderPageSkeleton";
import { useSession } from "@/context/SessionProvider";
import Link from "next/link";
import { useEffect } from "react";

const AccountOrder = () => {
  const { loading, error, data } = useQuery(GET_MY_ORDERS);
  const { customer } = useSession();

  useEffect(() => {
    if (customer?.id === "guest") {
      window.location.href = "/";
    }
  }, [customer]);

  if (loading) {
    return <LoadingSkeleton />; // Show loading skeleton while data is fetching
  }

  if (error) {
    return <p>Error: {error.message}</p>; // Show error if fetching fails
  }

  const hasOrders = data?.customer?.orders?.nodes?.length > 0;

  return (
    <div className="space-y-10 sm:space-y-12">
      <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>

      {hasOrders ? (
        data?.customer?.orders?.nodes?.map((order: any, index: any) => (
          <div
            key={index}
            className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-0"
          >
            <OrderHeader order={order} />
            <OrderItems lineItems={order?.lineItems?.nodes} />
          </div>
        ))
      ) : (
        <div className="container mx-auto grid items-center justify-center">
          <h1 className="text-2xl font-bold py-20 text-center">
            No Orders Placed Yet.
          </h1>
          <Link
            className="text-center self-center text-blue-500 font-bold underline hover:cursor-pointer hover:text-blue-800"
            href="/"
          >
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
};

const formatDate = (date: any) => {
  date = new Date(date);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

const OrderHeader = ({ order }: any) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-500/5">
    <div>
      <Link 
        href={`/checkout/payhere/${order?.orderNumber}`}
        className="text-lg font-semibold hover:text-primary-600 hover:underline"
      >
        #{order?.orderNumber}
      </Link>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 sm:mt-2">
        <span>{formatDate(order?.date)}</span>
        <span className="mx-2">·</span>
        <span
          className={`${
            order?.status === "CANCELLED" ? "text-red-500" : "text-primary-500"
          }`}
        >
          {order?.status}
        </span>
      </p>
      <p className="text-sm mt-1.5 sm:mt-2">
        <strong>Total:</strong>{" "}
        <span
          dangerouslySetInnerHTML={{
            __html: `${order?.total}`,
          }}
        />
      </p>
      <p className="text-sm mt-1.5 sm:mt-2">
        <strong>Payment Method:</strong> {order?.paymentMethod}
      </p>
    </div>
    <Link 
      href={`/checkout/payhere/${order?.orderNumber}`}
      className="mt-3 sm:mt-0 text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
    >
      View Order Details →
    </Link>
  </div>
);

const OrderItems = ({ lineItems }: any) => (
  <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8 divide-y divide-y-slate-200 dark:divide-slate-700">
    {lineItems?.map((item: any, index: any) => (
      <OrderItemProduct key={index} index={index} orderItem={item} />
    ))}
  </div>
);

export default AccountOrder;
