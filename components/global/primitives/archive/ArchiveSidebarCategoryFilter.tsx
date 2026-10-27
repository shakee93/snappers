"use client";

import Checkbox from "@/shared/Checkbox/Checkbox";
import type { ArchiveFilterCategoryOption } from "@/lib/archiveFilters";
import { filterCheckboxLabelClassName, filterFieldLabelClassName } from "@/components/global/primitives/Filters/filterStyles";

interface ArchiveSidebarCategoryFilterProps {
  categories: ArchiveFilterCategoryOption[];
  selectedIds: number[];
  onChange: (categoryIds: number[]) => void;
}

const ArchiveSidebarCategoryFilter = ({
  categories,
  selectedIds,
  onChange,
}: ArchiveSidebarCategoryFilterProps) => {
  if (!categories.length) return null;

  const toggle = (databaseId: number, checked: boolean) => {
    if (databaseId === 0) {
      if (checked) onChange([]);
      return;
    }
    const next = checked
      ? Array.from(new Set([...selectedIds, databaseId]))
      : selectedIds.filter((id) => id !== databaseId);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <span className={filterFieldLabelClassName}>Categories</span>
      <div className="divide-y divide-[#E8E8E8] rounded-xl border border-[#E8E8E8] bg-white px-4">
        <Checkbox
          name="archive-sidebar-category-all"
          label="All categories"
          labelPosition="after"
          className="w-full justify-between py-2.5"
          checked={selectedIds.length === 0}
          onChange={(checked) => toggle(0, checked)}
          labelClassName={filterCheckboxLabelClassName}
        />
        {categories.map((category) => (
          <Checkbox
            key={category.databaseId}
            name={`archive-sidebar-category-${category.databaseId}`}
            label={category.name}
            labelPosition="after"
            className="w-full justify-between py-2.5"
            checked={selectedIds.includes(category.databaseId)}
            onChange={(checked) => toggle(category.databaseId, checked)}
            labelClassName={filterCheckboxLabelClassName}
          />
        ))}
      </div>
    </div>
  );
};

export default ArchiveSidebarCategoryFilter;
