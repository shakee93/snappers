"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCategory } from "@/graphql/types/graphql";
import heartIcon from "@/public/global/heart.svg";
import truckIcon from "@/public/global/truck.svg";
import AvatarDropdown from "./AvatarDropdown";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SideCart from "./SideCart/SideCart";
import { accountTabHref } from "@/components/account/accountTabs";

interface HeaderContentProps {
  navCategories: ProductCategory[];
}

const iconButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-header-peach text-neutral-900 transition-[filter] hover:brightness-95";

const headerIconClass = "h-[18px] w-[18px] object-contain";

const HeaderContent = ({ navCategories }: HeaderContentProps) => {
  return (
    <div className="relative hidden overflow-visible bg-header-cream lg:block">
        <div className="mx-auto grid h-[86px] w-full max-w-[1368px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
          {/* Left: Logo */}
          <div className="flex min-w-0 items-center justify-start">
            <Logo />
          </div>

          {/* Center: main navigation */}
          <div className="flex items-center justify-center">
            <NavLinks navCategories={navCategories} />
          </div>

          {/* Right: saved list · orders · account · basket */}
          <div className="flex min-w-0 items-center justify-end gap-2.5">
            <Link
              href={accountTabHref("wishlist")}
              aria-label="Saved items"
              className={iconButtonClass}
            >
              <Image
                src={heartIcon}
                alt=""
                width={18}
                height={18}
                className={headerIconClass}
                aria-hidden
              />
            </Link>
            <Link
              href={accountTabHref("orders")}
              aria-label="My orders"
              className={iconButtonClass}
            >
              <Image
                src={truckIcon}
                alt=""
                width={18}
                height={18}
                className={headerIconClass}
                aria-hidden
              />
            </Link>
            <AvatarDropdown />
            <SideCart />
          </div>
        </div>
      </div>
  );
};

export default HeaderContent;
