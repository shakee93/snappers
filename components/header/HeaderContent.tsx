"use client";

import Link from "next/link";
import { Heart, Truck } from "lucide-react";
import { ProductCategory } from "@/graphql/types/graphql";
import AvatarDropdown from "./AvatarDropdown";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import SideCart from "./SideCart/SideCart";

interface HeaderContentProps {
  navCategories: ProductCategory[];
}

const iconButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-header-peach text-neutral-900 transition-[filter] hover:brightness-95";

const HeaderContent = ({ navCategories }: HeaderContentProps) => {
  return (
    <>
      {/* Mobile: search only — desktop nav/search live in the bars below */}
      <div className="lg:hidden gap-2 flex-1 justify-center items-center">
        <SearchBar />
      </div>

      {/* Desktop cream top bar: logo · nav · account + basket */}
      <div className="hidden lg:block bg-header-cream">
        <div className="grid h-[86px] w-full grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
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
              href="/account/save-lists"
              aria-label="Saved items"
              className={iconButtonClass}
            >
              <Heart className="w-[18px]" />
            </Link>
            <Link
              href="/account/my-orders"
              aria-label="My orders"
              className={iconButtonClass}
            >
              <Truck className="w-[18px]" />
            </Link>
            <AvatarDropdown />
            <SideCart />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderContent;
