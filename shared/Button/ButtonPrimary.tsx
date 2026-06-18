import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonPrimaryProps extends ButtonProps {}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  className = "",
  ...args
}) => {
  return (
    <Button
      className={cn(
        "ttnc-ButtonPrimary bg-primary-500 text-slate-50 shadow-xl hover:bg-slate-800 disabled:bg-opacity-90 dark:text-slate-800",
        className
      )}
      {...args}
    />
  );
};

export default ButtonPrimary;
