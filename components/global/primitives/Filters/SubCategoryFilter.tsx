"use client";

import { Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInstantSearch, useRefinementList } from "react-instantsearch";
import { UiState } from "instantsearch.js";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";

interface SubCategoryFilterProps {
  subCategories: Pick<ProductCategory, "databaseId" | "name" | "slug">[];
}

type MyUiState = UiState & {
  product: {
    categories: number[];
    query?: string;
  };
};

const SubCategoryFilter = ({ subCategories }: SubCategoryFilterProps) => {
  const {
    syncCategories,
    sidebar: { categories: selectedCategories },
  } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [facetSnapshot, setFacetSnapshot] = useState<
    { value: string; count: number }[]
  >([]);
  const { setUiState } = useInstantSearch<MyUiState>();

  const { items: categoriesFacet } = useRefinementList({
    attribute: "categories_facet",
  });

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFacetSnapshot(categoriesFacet);
    }
  }, [categoriesFacet, selectedCategories.length]);

  const handleChange = useCallback(
    (checked: boolean, databaseId: number) => {
      const newCategories = checked
        ? [...selectedCategories, databaseId]
        : selectedCategories.filter((id) => id !== databaseId);

      setUiState((prev) => ({
        ...prev,
        product: {
          ...(prev.product || {}),
          categories: newCategories,
          query: prev.product?.query || "",
        },
      }));

      syncCategories(newCategories);
    },
    [selectedCategories, setUiState, syncCategories],
  );

  const sortedSubCategories = useMemo(() => {
    return [...subCategories].sort((a, b) => {
      const countA =
        facetSnapshot.find((f) => Number(f.value) === a.databaseId)?.count || 0;
      const countB =
        facetSnapshot.find((f) => Number(f.value) === b.databaseId)?.count || 0;
      return countB - countA;
    });
  }, [facetSnapshot, subCategories]);

  if (subCategories.length === 0) {
    return null;
  }

  return (
    <div className="relative z-10 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="relative flex w-full flex-col space-y-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium transition-opacity hover:opacity-80"
        >
          <span>Subcategories</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        <Transition
          show={!isCollapsed}
          enter="transition-all duration-300 ease-out"
          enterFrom="max-h-0 opacity-0"
          enterTo="max-h-[1000px] opacity-100"
          leave="transition-all duration-300 ease-in"
          leaveFrom="max-h-[1000px] opacity-100"
          leaveTo="max-h-0 opacity-0"
        >
          <div className="grid grid-cols-1 gap-2">
            {sortedSubCategories.map((item) => (
              <Checkbox
                key={item.databaseId}
                name={item.slug || String(item.databaseId)}
                label={`${item.name} (${facetSnapshot.find((f) => Number(f.value) === item.databaseId)?.count || 0})`}
                defaultChecked={selectedCategories.includes(item.databaseId)}
                onChange={(checked) => handleChange(checked, item.databaseId)}
              />
            ))}
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default SubCategoryFilter;
