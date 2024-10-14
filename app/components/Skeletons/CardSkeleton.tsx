import React from "react";

const CardSkeleton = ({ className = "", cardCount = 3 }) => {
  return (
    <div className="flex ">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={index} className={`animate-pulse ${className} m-2`}>
          <div className="bg-gray-200 h-40 w-full rounded-md"></div>
          <div className="mt-2">
            <div className="bg-gray-200 h-4 w-3/4 rounded-md"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded-md mt-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
