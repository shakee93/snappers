"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMyOrders } from "@/hooks/useMyOrders";
import LoadingSkeleton from "@/components/global/primitives/OrderPageSkeleton";
import { useSession } from "@/context/SessionProvider";
import AccountOrderDetailModal from "@/components/account/AccountOrderDetailModal";
import {
  formatOrderDate,
  formatPaymentMethod,
  formatStatus,
  statusBadgeClass,
} from "@/components/account/accountOrderUtils";
import { parseWooMoneyAmount } from "@/lib/cartLinePricing";
import { formatPrice } from "@/lib/formatPrice";
import type {
  MyOrder,
  MyOrderLineItem,
  MyOrderProduct,
} from "@/graphql/defs/order";
import {
  accountLinkClassName,
  accountOrderCardClassName,
  accountPageTitleClassName,
} from "@/components/account/accountStyles";

const OrderProductThumb = ({
  product,
  extraCount,
}: {
  product?: MyOrderProduct | null;
  extraCount: number;
}) => {
  const imageUrl = product?.featuredImage?.node?.sourceUrl;
  const name = product?.name ?? "Product";

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E8E8E8] bg-neutral-50 sm:h-[72px] sm:w-[72px]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="72px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
          No image
        </div>
      )}
      {extraCount > 0 ? (
        <span className="absolute bottom-1 right-1 rounded-full bg-neutral-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
};

const OrderCard = memo(function OrderCard({
  order,
  onSelect,
}: {
  order: MyOrder;
  onSelect: (order: MyOrder) => void;
}) {
  const lineItems = useMemo(
    () =>
      (order.lineItems?.nodes ?? []).filter(
        (item): item is MyOrderLineItem => !!item?.product?.node,
      ),
    [order.lineItems?.nodes],
  );

  const firstItem = lineItems[0];
  const firstProduct = firstItem?.product?.node;
  const extraItemCount = Math.max(0, lineItems.length - 1);

  const productTitle = useMemo(
    () =>
      lineItems.length === 1
        ? firstProduct?.name ?? "Product"
        : `${firstProduct?.name ?? "Product"} + ${extraItemCount} more`,
    [extraItemCount, firstProduct?.name, lineItems.length],
  );

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(order)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(order);
        }
      }}
      className={`${accountOrderCardClassName} cursor-pointer transition-colors hover:bg-neutral-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-header-action/40`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <OrderProductThumb product={firstProduct} extraCount={extraItemCount} />

        <div className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-bold text-header-green">
              #{order.orderNumber}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-500">
              {order.date ? formatOrderDate(order.date) : "—"}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(order.status)}`}
            >
              {formatStatus(order.status)}
            </span>
          </div>

          <p className="mt-1.5 truncate text-sm font-semibold text-neutral-900">
            {productTitle}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {formatPaymentMethod(order.paymentMethod, order.paymentMethodTitle)}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:text-right">
          <p className="text-base font-bold text-neutral-900">
            {formatPrice(parseWooMoneyAmount(order.total))}
          </p>
          <span className="text-xs font-medium text-header-green">
            View details →
          </span>
        </div>
      </div>
    </article>
  );
});

const AccountOrdersPanel = () => {
  const { loading, error, data, refetch } = useMyOrders();
  const { customer } = useSession();
  const [selectedOrder, setSelectedOrder] = useState<MyOrder | null>(null);

  useEffect(() => {
    if (customer?.id === "guest") {
      window.location.href = "/";
    }
  }, [customer]);

  const orders = useMemo(
    () =>
      (data?.customer?.orders?.nodes ?? []).filter(
        (order): order is MyOrder => !!order,
      ),
    [data?.customer?.orders?.nodes],
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-red-600">Error: {error.message}</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className={accountPageTitleClassName}>Order History</h2>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onSelect={setSelectedOrder}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h3 className="text-xl font-bold text-neutral-900">
            No orders placed yet
          </h3>
          <p className="text-sm text-neutral-500">
            When you place an order, it will show up here.
          </p>
          <Link className={accountLinkClassName} href="/">
            Browse products
          </Link>
        </div>
      )}

      <AccountOrderDetailModal
        order={selectedOrder}
        show={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUploadSuccess={() => {
          void refetch();
        }}
      />
    </div>
  );
};

export default AccountOrdersPanel;
