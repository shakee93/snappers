"use client";

import Link from "next/link";
import { Heart, Truck } from "lucide-react";

const iconButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4CC] text-black transition-colors hover:bg-[#FFD4B0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F7A072] focus-visible:ring-offset-2";

const HeaderUtilityIcons = () => {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account/save-lists"
        className={iconButtonClass}
        aria-label="Wishlist"
      >
        <Heart className="h-[18px] w-[18px]" strokeWidth={2} />
      </Link>
      <Link
        href="/account/my-orders"
        className={iconButtonClass}
        aria-label="Order tracking"
      >
        <Truck className="h-[18px] w-[18px]" strokeWidth={2} />
      </Link>
    </div>
  );
};

export default HeaderUtilityIcons;
