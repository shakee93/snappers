import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  sizeClass?: string;
  fontClass?: string;
  rounded?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      sizeClass = "h-11 px-4 py-3",
      fontClass = "text-sm font-normal",
      rounded = "rounded-xl",
      children,
      type = "text",
      ...args
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "mt-0 block w-full border-neutral-200 bg-white focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600 dark:focus:ring-opacity-25 dark:disabled:bg-neutral-800",
          rounded,
          fontClass,
          sizeClass,
          className
        )}
        {...args}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
