"use client";

import SearchBar from "./SearchBar";
import HeaderCategoryBar from "./HeaderCategoryBar";
import type { ProductCategory } from "@/graphql/types/graphql";

type HeaderUtilityBarProps = {
  navCategories: ProductCategory[];
};

/**
 * Mobile: search on green bar. Desktop: dark category strip from WooCommerce.
 */
const HeaderUtilityBar = ({ navCategories }: HeaderUtilityBarProps) => {
  return (
    <>
      <div className="bg-header-green px-4 pb-3 lg:hidden">
        <SearchBar placeholder="Search for brand, products or categories..." />
      </div>

      <HeaderCategoryBar navCategories={navCategories} />
    </>
  );
};

export default HeaderUtilityBar;
