import React from "react";

const BrandsSkeleton = () => {
  // Create 20 brand placeholders to match the grid layout (4 rows of 5 cards each)
  const brandPlaceholderCount = 20;

  return (
    <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
      <div className="space-y-4 lg:space-y-14">
        {/* Header Section Skeleton */}
        <div className="max-w-screen-sm">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6 animate-pulse"></div>
          </div>
        </div>
        
        <hr className="border-slate-200 dark:border-slate-700 !mt-4" />
        
        {/* Brands Grid Skeleton */}
        <main className="!mt-4">
          <div className="w-full">
            <ul className="py-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-4">
              {Array.from({ length: brandPlaceholderCount }).map((_, index) => (
                <li key={index} className="flex flex-col items-center">
                  <div className="group flex flex-col items-center w-full h-full px-4 py-4 rounded-lg">
                    {/* Brand Logo Area Skeleton */}
                    <div className="w-40 h-28 flex items-center justify-center mb-3 bg-gray-200 dark:bg-gray-700 rounded-2xl shadow-sm animate-pulse">
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                    
                    {/* Brand Name and Count Skeleton */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-12 animate-pulse"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BrandsSkeleton; 