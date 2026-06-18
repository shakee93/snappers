"use client";
import { useEffect } from "react";
import { useStore } from "@/store/store";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import CategoryFilter from "@/components/global/primitives/Filters/CategoryFilter";
import BrandFilter from "@/components/global/primitives/Filters/BrandFilter";
import SubCategoryFilter from "@/components/global/primitives/Filters/SubCategoryFilter";
import FilterResetButton from "@/components/global/primitives/Filters/FilterResetButton";
import { filterPanelTitleClassName } from "@/components/global/primitives/Filters/filterStyles";
import { DealFilterType } from "@/lib/dealFilters";

interface TabFilterProps {
  categories?: ProductCategory[];
  subCategories?: ProductCategory[];
  category?: ProductCategory;
  brands?: Brand[];
  brand?: Brand;
  dealsType?: DealFilterType[];
  inStockOnly?: boolean;
  defaultSort?: string;
  resetSearchQuery?: boolean;
}

const TabFilters = ({
  categories = [],
  subCategories = [],
  brands = [],
  brand,
  category,
  dealsType,
  inStockOnly = false,
  defaultSort = "",
  resetSearchQuery = false,
}: TabFilterProps) => {
  const { setMounted } = useStore();

  useEffect(() => {
    setMounted();
  }, [setMounted]);

  return (
    <div className="flex flex-col gap-0 lg:gap-3 lg:space-x-4">
      <div className="hidden flex-1 flex-col items-start justify-start space-y-3 lg:flex">
        <div className="flex w-full items-center justify-between border-b border-neutral-200 pb-2">
          <span className={filterPanelTitleClassName}>Filters</span>
          <FilterResetButton
            defaultSort={defaultSort}
            resetDealsFilter={!!dealsType}
            ignoreInStock={inStockOnly}
            resetSearchQuery={resetSearchQuery}
          />
        </div>
        {subCategories.length > 0 ? (
          <SubCategoryFilter subCategories={subCategories} />
        ) : null}
        {!category ? <CategoryFilter categories={categories} /> : null}
        {!brand ? <BrandFilter brands={brands} /> : null}
      </div>
    </div>
  );
};

export default TabFilters;
