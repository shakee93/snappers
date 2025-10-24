import React, { FC, useEffect, useState } from "react";

export interface CheckboxProps {
  label?: string;
  subLabel?: string;
  className?: string;
  sizeClassName?: string;
  labelClassName?: string;
  name: string;
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
  defaultChecked,
  onChange,
}) => {
  const [defaultStatus, setDefault] = useState(defaultChecked)

  useEffect(() => {
    setDefault(defaultChecked)
  }, [defaultChecked])

  return (
    <div className={`flex text-sm sm:text-xs ${className}`}>
      <input
        id={name}
        name={name}
        type="checkbox"
        className={`focus:ring-action-primary text-primary-500 rounded border-slate-400 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 ${sizeClassName}`}
        checked={defaultChecked}
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      {label && (
        <label
          htmlFor={name}
          className="pl-2.5 sm:pl-2.5 text-xs flex flex-col flex-1 justify-center select-none"
        >
          <span
            className={`text-slate-900 dark:text-slate-100 ${labelClassName} ${!!subLabel ? "-mt-0.5" : ""
              }`}
          >
            {label}
          </span>
          {subLabel && (
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs font-light">
              {subLabel}
            </p>
          )}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
