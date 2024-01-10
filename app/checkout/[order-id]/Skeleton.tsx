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

export default OrderPaymentPageSkeleton;
