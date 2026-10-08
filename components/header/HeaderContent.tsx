"use client";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import HeaderUtilityActions from "./HeaderUtilityActions";
import HeaderCategoryBar from "./HeaderCategoryBar";
import type { ProductCategory } from "@/graphql/types/graphql";

type HeaderContentProps = {
  navCategories: ProductCategory[];
};

const HeaderContent = ({ navCategories }: HeaderContentProps) => {
  return (
    <div className="relative hidden overflow-visible bg-white lg:block">
      <div className="mx-auto flex h-[96px] w-full max-w-[1368px] items-center gap-2 px-3 lg:gap-3 lg:px-4 xl:h-[104px] xl:gap-6 xl:px-6">
        <div className="shrink-0">
          <Logo imageClass="lg:h-14 xl:h-16" />
        </div>

        <div className="min-w-0 flex-1">
          <SearchBar placeholder="Search for brand, products or categories..." />
        </div>

        <div className="relative z-[260] shrink-0">
          <HeaderUtilityActions />
        </div>
      </div>

      <HeaderCategoryBar navCategories={navCategories} />
    </div>
  );
};

export default HeaderContent;
