"use client";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Mail, Phone } from "lucide-react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";
import OrderBankReceiptUpload from "@/components/global/ui/OrderBankReceiptUpload";
import { getProductPath } from "@/lib/productUrl";
import {
  canCancelOrder,
  formatLineItemVariation,
  formatOrderMoney,
  formatOrderSummaryDate,
  formatPaymentMethod,
  formatStatus,
  getOrderLineItemImageUrl,
  getOrderLineItemName,
} from "@/components/account/accountOrderUtils";
import { isLineItemFree, parseWooMoneyAmount } from "@/lib/cartLinePricing";
import { decodeHtmlEntities } from "@/lib/decodeHtmlEntities";
import {
  hasSavedAddress,
} from "@/lib/formatCustomerAddress";
import type { MyOrder, MyOrderLineItem } from "@/graphql/defs/order";
import ReorderButton from "@/components/account/ReorderButton";
import CancelOrderButton from "@/components/account/CancelOrderButton";

const DetailRow = ({
  label,
  value,
  boldValue = false,
}: {
  label: string;
  value: React.ReactNode;
  boldValue?: boolean;
}) => (
  <tr className="border-t border-[#E8E8E8]">
    <td className="px-4 py-3 pr-4 align-top text-sm text-neutral-700">{label}</td>
    <td
      className={`px-4 py-3 text-right align-top text-sm text-neutral-900 ${
        boldValue ? "font-bold" : ""
      }`}
    >
      {value}
    </td>
  </tr>
);

const ProductRow = ({ item }: { item: MyOrderLineItem }) => {
  const product = item.product?.node;
  const link = product?.slug ? getProductPath({ slug: product.slug }) : "";
  const name = getOrderLineItemName(item);
  const imageUrl = getOrderLineItemImageUrl(item);
  const variationLabel = formatLineItemVariation(item);
  const quantity = item.quantity ?? 1;
  const isFree = isLineItemFree(item.total, item.subtotal);
  const priceLabel = isFree
    ? "Free"
    : formatOrderMoney(item.total ?? item.subtotal);

  const nameBlock = (
    <>
      <span className="font-medium text-neutral-900">
        {name} × {quantity}
      </span>
      {variationLabel ? (
        <p className="mt-0.5 text-xs font-normal text-neutral-500">
          {variationLabel}
        </p>
      ) : null}
    </>
  );

  return (
    <tr className="border-t border-[#E8E8E8]">
      <td className="px-4 py-3 pr-4 align-top text-sm">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E8E8E8] bg-neutral-50">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] leading-tight text-neutral-400">
                No image
              </div>
            )}
          </div>
          {link ? (
            <Link
              href={link}
              className="min-w-0 underline decoration-neutral-300 underline-offset-2 hover:text-header-green"
            >
              {nameBlock}
            </Link>
          ) : (
            <div className="min-w-0">{nameBlock}</div>
          )}
        </div>
      </td>
      <td
        className={`px-4 py-3 text-right align-top text-sm ${
          isFree ? "font-bold text-green-600" : "text-neutral-900"
        }`}
      >
        {priceLabel}
      </td>
    </tr>
  );
};

const BillingAddressBlock = ({
  billing,
}: {
  billing: NonNullable<MyOrder["billing"]>;
}) => {
  const name = [billing.firstName, billing.lastName].filter(Boolean).join(" ");
  const locality = [billing.city, billing.state, billing.postcode]
    .filter(Boolean)
    .join(", ");
  const addressLines = [billing.address1, billing.address2, locality].filter(
    Boolean
  );

  return (
    <div className="rounded-xl border border-[#E8E8E8] p-4 text-sm text-neutral-700">
      {name ? <p className="font-medium text-neutral-900">{name}</p> : null}
      {addressLines.map((line, index) => (
        <p key={`billing-line-${index}`}>{line}</p>
      ))}
      {billing.phone ? (
        <p className="mt-2 flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          <a href={`tel:${billing.phone}`} className="hover:text-header-green">
            {billing.phone}
          </a>
        </p>
      ) : null}
      {billing.email ? (
        <p className="mt-1 flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          <a
            href={`mailto:${billing.email}`}
            className="break-all hover:text-header-green"
          >
            {billing.email}
          </a>
        </p>
      ) : null}
    </div>
  );
};

interface AccountOrderDetailModalProps {
  order: MyOrder | null;
  show: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  onReorder: (order: MyOrder) => void;
  reordering?: boolean;
  onCancel?: (order: MyOrder) => void;
  cancelling?: boolean;
}

const AccountOrderDetailModal = ({
  order,
  show,
  onClose,
  onUploadSuccess,
  onReorder,
  reordering = false,
  onCancel,
  cancelling = false,
}: AccountOrderDetailModalProps) => {
  if (!order) return null;

  const isBankTransfer =
    order.paymentMethod === "banktransfer" || order.paymentMethod === "bacs";
  const isCompletedOrCancelled =
    order.status === "COMPLETED" ||
    order.status === "CANCELLED" ||
    order.status === "FAILED";
  const metaData = order.metaData ?? [];
  const receiptUploaded = metaData.some((meta) => {
    const key = meta?.key || "";
    const value = meta?.value || "";
    return key === "bank_slip" && value && value.trim() !== "";
  });
  const statusIndicatesUploaded = order.status === "PROCESSING";
  const needsReceiptUpload =
    isBankTransfer &&
    !isCompletedOrCancelled &&
    !receiptUploaded &&
    !statusIndicatesUploaded;
  const orderDatabaseId =
    order.databaseId?.toString() || order.orderNumber || "";
  const lineItems = (order.lineItems?.nodes ?? []).filter(
    (item): item is MyOrderLineItem => !!item,
  );
  const billing = order.billing;
  const hasBilling = hasSavedAddress(billing);
  const shippingLine = order.shippingLines?.nodes?.[0];
  const shippingLabel = decodeHtmlEntities(
    shippingLine?.methodTitle?.trim() ||
      (parseWooMoneyAmount(order.shippingTotal) > 0
        ? formatOrderMoney(order.shippingTotal)
        : "Free shipping")
  );

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[1100]" onClose={onClose}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-left shadow-xl">
              <div className="flex items-start justify-between border-b border-[#E8E8E8] px-5 py-4 sm:px-6">
                <Dialog.Title className="pr-8 text-base font-normal text-neutral-700 sm:text-lg">
                  Order{" "}
                  <span className="font-bold text-neutral-900">
                    #{order.orderNumber}
                  </span>{" "}
                  was placed on{" "}
                  <span className="font-bold text-neutral-900">
                    {order.date ? formatOrderSummaryDate(order.date) : "—"}
                  </span>{" "}
                  and is currently{" "}
                  <span className="font-bold text-neutral-900">
                    {formatStatus(order.status)}
                  </span>
                  .
                </Dialog.Title>
                <ButtonClose onClick={onClose} />
              </div>

              <div className="hiddenScrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <section className="mb-6">
                  <h3 className="mb-3 text-base font-semibold text-neutral-900">
                    Order details
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-[#E8E8E8]">
                    <table className="w-full">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                            Product
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="px-4">
                        {lineItems.map((item) => (
                          <ProductRow
                            key={item.databaseId ?? item.id}
                            item={item}
                          />
                        ))}
                        <DetailRow
                          label="Subtotal:"
                          value={formatOrderMoney(order.subtotal)}
                        />
                        <DetailRow label="Shipping:" value={shippingLabel} />
                        <DetailRow
                          label="Total:"
                          value={formatOrderMoney(order.total)}
                          boldValue
                        />
                        <DetailRow
                          label="Payment method:"
                          value={formatPaymentMethod(
                            order.paymentMethod,
                            order.paymentMethodTitle
                          )}
                        />
                      </tbody>
                    </table>
                  </div>
                </section>

                {hasBilling && billing ? (
                  <section className="mb-6">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                      Billing address
                    </h3>
                    <BillingAddressBlock billing={billing} />
                  </section>
                ) : null}

                {isBankTransfer && !isCompletedOrCancelled ? (
                  <section className="mb-2">
                    {needsReceiptUpload ? (
                      <OrderBankReceiptUpload
                        orderNumber={order.orderNumber ?? ""}
                        orderId={orderDatabaseId}
                        onUploadSuccess={onUploadSuccess}
                      />
                    ) : receiptUploaded || statusIndicatesUploaded ? (
                      <span className="text-xs font-medium text-header-green">
                        ✓ Bank receipt uploaded
                      </span>
                    ) : null}
                  </section>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E8E8] bg-neutral-50 px-5 py-4 sm:px-6">
                {order.paymentMethod === "payhere" ? (
                  <Link
                    href={`/checkout/payhere/${order.orderNumber}`}
                    className="text-sm font-medium text-header-green hover:underline"
                    onClick={onClose}
                  >
                    View payment details →
                  </Link>
                ) : (
                  <span />
                )}
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                  {onCancel && canCancelOrder(order.status) ? (
                    <CancelOrderButton
                      loading={cancelling}
                      onClick={() => onCancel(order)}
                    />
                  ) : null}
                  <ReorderButton
                    loading={reordering}
                    onClick={() => onReorder(order)}
                  />
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AccountOrderDetailModal;
