import React, { FC } from "react";

export interface PricesProps {
  className?: string;
  price?: number;
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
        <span className="text-slate-500 !leading-none">
          Rs.{price.toFixed(2)}
        </span>
      </div>
      <div
        className={`flex ${contentClass}`}
      >
        <s className="text-red-300 text-sm">
          Rs.{price.toFixed(2)}
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
