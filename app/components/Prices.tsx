import React, { FC } from "react";

export interface PricesProps {
  className?: string;
  price?: string | number;
  contentClass?: string;
}

const Prices: FC<PricesProps> = ({
  className = "",
  price = 33,
  contentClass = " text-base font-medium",
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <div
        className={`flex ${contentClass}`}
      >
        <span className="text-[#335fac] text-base lg:text-lg font-bold !leading-none">
          {/* Rs.{price.toFixed(2)} */}
          Rs.{price}
        </span>
      </div>
      <div
        className={`flex ${contentClass}`}
      >
        <s className="text-gray-400 text-xs lg:text-sm">
          {/* Rs.{price.toFixed(2)} */}
          Rs.{price}
        </s>
      </div>
      <div
        className={`flex ${contentClass}`}
      >
    
      </div>
    </div>
    
  );
};

export default Prices;
