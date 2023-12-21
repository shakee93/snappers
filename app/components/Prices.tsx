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
        <div className={`flex gap-2 items-center ${className}`}>
            <div
                className={`flex items-center border-2 border-gray-300 rounded-lg p-2 ${contentClass}`}
            >
                <span className="text-slate-950 text-base lg:text-sm font-bold !leading-none">
                    {price}
                </span>
            </div>

            {salePrice && salePrice !== price && (
                <div className={`flex ${contentClass}`}>
                    <s className="text-gray-400 text-xs lg:text-sm">
                        {salePrice}
                    </s>
                </div>
            )}

        </div>



    );
};

export default Prices;
