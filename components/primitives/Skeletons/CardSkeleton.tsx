import React from "react";

const CardSkeleton = ({ className = "", cardCount = 5 }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={index} className={`animate-pulse bg-white rounded-lg shadow-sm ${className} w-[calc(20%-12.8px)]`}>
          {/* Product Image Area */}
          <div className="relative bg-gray-200 h-48 w-full rounded-t-lg">
            {/* Expand icon skeleton */}
            <div className="absolute top-2 right-2 bg-gray-300 h-6 w-6 rounded-full"></div>
            {/* Buy Now button skeleton */}
            <div className="absolute bottom-2 right-2 bg-gray-300 h-8 w-20 rounded-md"></div>
          </div>
          
          {/* Product Details Area */}
          <div className="p-3">
            {/* Product Name */}
            <div className="bg-gray-200 h-5 w-full rounded-md mb-2"></div>
            
            {/* Brand and Stock Status */}
            <div className="flex justify-between items-center mb-2">
              <div className="bg-gray-200 h-4 w-20 rounded-md"></div>
              <div className="bg-gray-200 h-4 w-16 rounded-md"></div>
            </div>
            
            {/* Pricing */}
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gray-200 h-6 w-20 rounded-md"></div>
              <div className="bg-gray-200 h-4 w-16 rounded-md"></div>
            </div>
            
            {/* Payment Option */}
            <div className="bg-gray-200 h-4 w-40 rounded-md mb-2"></div>
            
            {/* Payment Partner Logo */}
            <div className="bg-gray-200 h-6 w-16 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
