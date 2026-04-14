import React, { FC } from "react";

export interface RadioProps {
  className?: string;
  name: string;
  id: string;
  onChange?: (value: string) => void;
  /** When set, the input is controlled (preferred for radio groups that sync with React state). */
  checked?: boolean;
  defaultChecked?: boolean;
  sizeClassName?: string;
  label?: string;
}

const Radio: FC<RadioProps> = ({
  className = "",
  name,
  id,
  onChange,
  label,
  sizeClassName = "w-5 h-5",
  checked,
  defaultChecked,
}) => {
  const controlled = checked !== undefined;
  return (
    <div className={`flex items-center text-xs sm:text-xs cursor-pointer ${className}`}>
      <input
        id={id}
        name={name}
        type="radio"
        className={`focus:ring-action-primary text-primary-500 rounded-full border-slate-400 hover:border-slate-700 bg-transparent dark:border-slate-700 dark:hover:border-slate-500 dark:checked:bg-primary-500 focus:ring-primary-500 text-sm ${sizeClassName}`}
        onChange={(e) => onChange && onChange(e.target.value)}
        {...(controlled
          ? { checked }
          : { defaultChecked })}
        value={id}
      />
      {label && (
        <label
          htmlFor={id}
          className="pl-2.5 sm:pl-2.5 block text-slate-900 text-xs dark:text-slate-100 select-none"
          dangerouslySetInnerHTML={{ __html: label }}
        ></label>
      )}
    </div>
  );
};

export default Radio;
