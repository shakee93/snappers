"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistProvider";
import { accountTabHref } from "@/components/account/accountTabs";
import AvatarDropdown from "./AvatarDropdown";
import SideCart from "./SideCart/SideCart";
import {
  HEADER_ACTION_BADGE,
  HEADER_ACTION_ICON,
  HEADER_ACTION_ICON_BOX,
  HEADER_ACTION_ITEM,
  HEADER_ACTION_LABEL,
} from "./headerActionStyles";

/** Desktop header: Wishlist · Account · Cart (reference layout, no compare). */
export default function HeaderUtilityActions() {
  const { count: wishlistCount } = useWishlist();

  return (
    <nav
      className="flex items-center gap-3 lg:gap-4 xl:gap-8 2xl:gap-10"
      aria-label="Header shortcuts"
    >
      <Link
        href={accountTabHref("wishlist")}
        className={HEADER_ACTION_ITEM}
      >
        <span className={HEADER_ACTION_ICON_BOX}>
          <Heart className={HEADER_ACTION_ICON} aria-hidden />
          <span className={HEADER_ACTION_BADGE}>{wishlistCount}</span>
        </span>
        <span className={HEADER_ACTION_LABEL}>Wishlist</span>
      </Link>

      <AvatarDropdown variant="labeled" />

      <SideCart variant="labeled" />
    </nav>
  );
}
