"use client";
import { useMyOrders } from "@/hooks/useMyOrders";
import OrderItemProduct from "@/app/(chromed)/containers/ProductDetailPage/OrderItem";
import LoadingSkeleton from "@/components/global/primitives/OrderPageSkeleton";
import { useSession } from "@/context/SessionProvider";
import Link from "next/link";
import { useEffect } from "react";
import OrderBankReceiptUpload from "@/components/global/ui/OrderBankReceiptUpload";

const AccountOrder = () => {
  const { loading, error, data, refetch } = useMyOrders();
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
            <OrderHeader order={order} onUploadSuccess={refetch} />
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

const OrderHeader = ({ order, onUploadSuccess }: any) => {
  // Check if this is a bank transfer order that needs receipt upload
  const isBankTransfer = order?.paymentMethod === "banktransfer" || order?.paymentMethod === "bacs";
  const isCompletedOrCancelled = order?.status === "COMPLETED" || order?.status === "CANCELLED" || order?.status === "FAILED";
  
  // Check if receipt has already been uploaded by looking at metaData
  // Backend updates order meta with key 'bank_slip' when receipt is uploaded
  const metaData = order?.metaData || [];
  const receiptUploaded = metaData.some((meta: any) => {
    const key = meta?.key || "";
    const value = meta?.value || "";
    // Check for 'bank_slip' key - if it exists and has a value, receipt is uploaded
    return key === "bank_slip" && value && value.trim() !== "";
  });
  
  // If status is PROCESSING (and was previously ON_HOLD/PENDING), it likely means receipt was processed
  // Don't show upload if status is PROCESSING, COMPLETED, or CANCELLED
  const statusIndicatesUploaded = order?.status === "PROCESSING";
  
  const needsReceiptUpload = isBankTransfer && !isCompletedOrCancelled && !receiptUploaded && !statusIndicatesUploaded;
  
  // Use databaseId if available, otherwise fallback to orderNumber
  const orderDatabaseId = order?.databaseId?.toString() || order?.orderNumber || "";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-500/5">
        <div>
          {order?.paymentMethod === "payhere" ? (
            <Link
              href={`/checkout/payhere/${order?.orderNumber}`}
              className="text-lg font-semibold hover:text-primary-600 hover:underline"
            >
              #{order?.orderNumber}
            </Link>
          ) : (
            <span className="text-lg font-semibold">#{order?.orderNumber}</span>
          )}
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
          <div className="text-sm mt-1.5 sm:mt-2">
            <strong>Payment Method:</strong> {order?.paymentMethod}
            {isBankTransfer && !isCompletedOrCancelled && (
              <div className="mt-1">
                {needsReceiptUpload ? (
                  <OrderBankReceiptUpload
                    orderNumber={order?.orderNumber}
                    orderId={orderDatabaseId}
                    onUploadSuccess={onUploadSuccess}
                  />
                ) : (receiptUploaded || statusIndicatesUploaded) ? (
                  <span className="text-xs text-green-600 dark:text-green-400">✓ Bank receipt uploaded</span>
                ) : null}
              </div>
            )}
          </div>
        </div>
        {order?.paymentMethod === "payhere" && (
          <Link
            href={`/checkout/payhere/${order?.orderNumber}`}
            className="mt-3 sm:mt-0 text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
          >
            View Order Details →
          </Link>
        )}
      </div>
    </div>
  );
};

const OrderItems = ({ lineItems }: any) => (
  <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8 divide-y divide-y-slate-200 dark:divide-slate-700">
    {lineItems?.map((item: any, index: any) => (
      <OrderItemProduct key={index} index={index} orderItem={item} />
    ))}
  </div>
);

export default AccountOrder;
