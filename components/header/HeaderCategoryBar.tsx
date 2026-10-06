"use client";

import { useMemo } from "react";
import type { ProductCategory } from "@/graphql/types/graphql";
import { getHeaderBarCategories } from "@/lib/headerCategories";
import HeaderCategoryNavItem from "@/components/header/HeaderCategoryNavItem";

type HeaderCategoryBarProps = {
  navCategories: ProductCategory[];
};

/** Category strip — brand icon + label (desktop). */
export default function HeaderCategoryBar({
  navCategories,
}: HeaderCategoryBarProps) {
  const categories = useMemo(
    () => getHeaderBarCategories(navCategories),
    [navCategories],
  );

  if (categories.length === 0) return null;

  return (
    <div className="relative z-[250] hidden overflow-visible border-y border-neutral-200 bg-header-cream lg:block">
      <div
        data-header-category-shell
        className="mx-auto flex min-h-[56px] max-w-[1368px] items-center overflow-visible px-3 py-2 lg:px-4 xl:px-6"
      >
        <nav
          aria-label="Shop categories"
          className="flex w-full flex-nowrap items-center justify-center gap-x-2 overflow-visible lg:gap-x-2.5 xl:gap-x-5 2xl:gap-x-8"
        >
          {categories.map((category, index) => {
            const slug = category.slug;
            if (!slug) return null;

            return (
              <HeaderCategoryNavItem
                key={slug}
                category={category}
                navCategories={navCategories}
                isLastInBar={index === categories.length - 1}
              />
            );
          })}
        </nav>
      </div>
    </div>
  );
}
