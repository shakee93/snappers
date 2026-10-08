import type { FC } from "react";
import { cn } from "@/lib/utils";
import { filterCheckboxInputClassName } from "@/components/global/primitives/Filters/filterStyles";

export interface CheckboxProps {
  label?: string;
  subLabel?: string;
  className?: string;
  sizeClassName?: string;
  labelClassName?: string;
  labelPosition?: "before" | "after";
  name: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  setDefault?: () => void
}

const Checkbox: FC<CheckboxProps> = ({
  subLabel = "",
  label = "",
  name,
  className = "",
  sizeClassName = "w-5 h-5",
  labelClassName = "",
  labelPosition = "before",
  checked,
  defaultChecked,
  onChange,
}) => {
  const isChecked = checked !== undefined ? checked : defaultChecked;
  const labelAfter = labelPosition === "after";

  const input = (
    <input
      id={name}
      name={name}
      type="checkbox"
      className={cn(filterCheckboxInputClassName, sizeClassName, "shrink-0")}
      checked={isChecked}
      onChange={(e) => onChange && onChange(e.target.checked)}
    />
  );

  const labelEl = label ? (
    <label
      htmlFor={name}
      className={cn(
        "flex flex-col justify-center text-xs select-none",
        labelAfter ? "min-w-0 flex-1 pr-2" : "flex-1 pl-2.5",
      )}
    >
      <span
        className={cn(
          !labelClassName && "text-slate-900 dark:text-slate-100",
          subLabel && "-mt-0.5",
          labelClassName,
        )}
      >
        {label}
      </span>
      {subLabel && (
        <p className="mt-0.5 text-xs font-light text-slate-500 dark:text-slate-400">
          {subLabel}
        </p>
      )}
    </label>
  ) : null;

  return (
    <div
      className={cn(
        "flex text-sm sm:text-xs",
        labelAfter && "items-center",
        className,
      )}
    >
      {labelAfter ? (
        <>
          {labelEl}
          {input}
        </>
      ) : (
        <>
          {input}
          {labelEl}
        </>
      )}
    </div>
  );
};

export default Checkbox;
