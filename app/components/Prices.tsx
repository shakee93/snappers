import React, { FC } from "react";
import { Maybe } from "@/graphql/types/graphql";

export interface PricesProps {
    className?: string;
    price?: string | number | Maybe<string>;
    salePrice?: string | number | Maybe<string>;
    contentClass?: string;
}

const Prices: FC<PricesProps> = ({
    className = "",
    price = 33,
    salePrice = null,
    contentClass = " text-base font-medium",
}) => {
    return (
        <div className={`flex gap-2 ${className}`}>
            <div
                className={`flex ${contentClass}`}
            >
                <span className="text-[#335fac] text-base lg:text-lg font-bold !leading-none">
                    {price}
                </span>
            </div>
            {salePrice &&
                <div
                    className={`flex ${contentClass}`}
                >
                    <s className="text-gray-400 text-xs lg:text-sm">
                        {price}
                    </s>
                </div>
            }
        </div>

    );
};

export default Prices;
