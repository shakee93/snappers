import React from 'react';

const SkeletonElement = ({ className }: any) => {
  return <div className={`animate-pulse bg-gray-300 ${className}`}></div>;
};

const SkeletonOrderDetails = () => (
  <div className="space-y-4 p-4">
    <SkeletonElement className="h-20 w-3/4" />
    <SkeletonElement className="h-4 w-full" />
    <SkeletonElement className="h-4 w-full" />
    <SkeletonElement className="h-4 w-full" />
    <SkeletonElement className="h-4 w-full" />
  </div>
);

const SkeletonProductTable = () => (
  <div className="space-y-4 p-4">
    <SkeletonElement className="h-6 w-1/2" />
    <div className="space-y-3">
      <SkeletonElement className="h-40 w-full" />
      <SkeletonElement className="h-4 w-full" />
      <SkeletonElement className="h-4 w-full" />
    </div>
  </div>
);

const SkeletonPaymentButton = () => (
  <div className="p-4">
    <SkeletonElement className="h-10 w-1/4" />
  </div>
);

const OrderPaymentPageSkeleton = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <SkeletonOrderDetails />
        <SkeletonPaymentButton />
        <SkeletonProductTable />
      </div>
    </div>
  );
};

export const CheckoutDetailsSkeleton = ()=>{
    return (
        <div className="container mx-auto gap-4 space-y-8">
            <div className="animate-pulse space-y-4">
                <div className="h-16 w-1/4 rounded bg-gray-300"></div>
                <div className="h-8 rounded bg-gray-300"></div>
                <div className="h-8 rounded bg-gray-300"></div>
                <div className="h-10 bg-gray-300 w-32 rounded-full"></div>
            </div>

            <div className="animate-pulse space-y-4">
                <div className="h-16 w-1/4 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-300"></div>
                <div className="h-8 rounded bg-gray-300"></div>
                <div className="h-10 bg-gray-300 w-32 rounded-full"></div>
            </div>

            <div className="animate-pulse space-y-4">
                <div className="h-16 w-1/4 rounded bg-gray-300"></div>
                <div className="h-8 rounded bg-gray-300"></div>
                <div className="h-8 rounded bg-gray-300"></div>
                <div className="h-10 bg-gray-300 w-32 rounded-full"></div>
            </div>
        </div>
    )
}

export default OrderPaymentPageSkeleton;
