"use client";

import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterSelectClassName,
  filterSelectOptionClassName,
  filterSelectOptionsClassName,
} from "@/components/global/primitives/Filters/filterStyles";

export interface FilterSelectOption {
  id: string;
  label: string;
}

interface FilterSelectProps {
  id?: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  "aria-label"?: string;
}

const FilterSelect = ({
  id,
  value,
  options,
  onChange,
  className,
  buttonClassName,
  "aria-label": ariaLabel,
}: FilterSelectProps) => {
  const selected =
    options.find((option) => option.id === value) ?? options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn("relative", className)}>
        <Listbox.Button
          id={id}
          aria-label={ariaLabel}
          className={cn(
            filterSelectClassName,
            "flex h-9 min-w-[9.5rem] items-center justify-between gap-2 sm:min-w-[11rem]",
            buttonClassName,
          )}
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        </Listbox.Button>

        <Listbox.Options className={filterSelectOptionsClassName}>
          {options.map((option) => (
            <Listbox.Option
              key={option.id}
              value={option.id}
              className={({ active, selected: isSelected }) =>
                filterSelectOptionClassName(active, isSelected)
              }
            >
              <span className="block truncate">{option.label}</span>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default FilterSelect;
