import React, {FC} from "react";
import {Maybe} from "@/graphql/types/graphql";
import {twMerge} from "tailwind-merge";


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
        <div className={twMerge(
            `flex flex-col lg:gap-3 gap-1 items-center justify-start`,
            className
        )}>
            {price ?
                <div
                    className={`flex items-center border-2 border-gray-300 rounded-lg p-2 ${contentClass}`}
                >
                <span className="text-slate-950 text-xs lg:text-sm font-bold !leading-none">
                    {/* {price} */}
                    {/* html parse the cleaned price */} 
                    <span dangerouslySetInnerHTML={{ __html: price || '' }} />
                </span>
                </div> : <></>
            }

            {(salePrice && salePrice !== price) ? (
                <div className={`flex w-full ${contentClass}`}>
                    <span className="text-red-400 font-bold line-through text-xs lg:text-sm" dangerouslySetInnerHTML={{ __html: salePrice || '' }} />
                </div>
            ): <></>}

        </div>



    );
};

export default Prices;
