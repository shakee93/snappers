import React, { FC } from "react";
import { Maybe } from "@/graphql/types/graphql";
import { twMerge } from "tailwind-merge";

export interface PricesProps {
  className?: string;
  price?: string | number | Maybe<string>;
  salePrice?: string | number | Maybe<string>;
  contentClass?: string;
}

const Prices: FC<PricesProps> = ({
  className = "",
  price = null,
  salePrice = null,
  contentClass = " text-base font-medium",
}) => {
  return (
    <div
      className={twMerge(
        `flex flex-col lg:flex-row lg:gap-2.5 gap-1 items-start lg:items-center justify-start flex-wrap`,
        className
      )}
    >
      {price ? (
        <div
          className={`flex items-center rounded-lg ${contentClass}`}
        >
          <span className="text-slate-950 text-sm font-bold !leading-none">
            <span dangerouslySetInnerHTML={{ __html: price || "" }} />
          </span>
        </div>
      ) : null}
      {salePrice && salePrice !== price ? (
        <div
          className={`flex w-full ${contentClass} flex-wrap lg:flex-nowrap lg:w-auto`}
        >
          <span
            className="text-slate-400 dark:text-slate-500 font-normal line-through text-sm break-words lg:whitespace-nowrap max-w-full lg:max-w-none"
            dangerouslySetInnerHTML={{ __html: salePrice || "" }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Prices;
