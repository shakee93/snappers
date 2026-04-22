"use client";

import Prices from "@/app/components/Prices";
import { isLineItemFree } from "@/lib/cartLinePricing";
import { twMerge } from "tailwind-merge";

type Props = {
  lineTotal?: string | null;
  lineSubtotal?: string | null;
  catalogPrice?: string | null;
  catalogSalePrice?: string | null;
  showOriginalPrice?: boolean;
  contentClass?: string;
  className?: string;
};

/** Uses cart line totals when present so BOGO / discounted lines show "Free" instead of catalog price. */
export default function LineOrCartPriceLabel({
  lineTotal,
  lineSubtotal,
  catalogPrice,
  catalogSalePrice,
  showOriginalPrice = true,
  contentClass,
  className,
}: Props) {
  if (isLineItemFree(lineTotal, lineSubtotal)) {
    return (
      <span
        className={twMerge("text-sm font-bold text-green-600", className)}
      >
        Free
      </span>
    );
  }
  return (
    <Prices
      price={catalogPrice}
      salePrice={showOriginalPrice ? catalogSalePrice : null}
      contentClass={contentClass}
      className={className}
    />
  );
}
