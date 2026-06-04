import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";

export interface ButtonPrimaryProps extends ButtonProps {}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  className = "",
  ...args
}) => {
  return (
    <Button
      className={`ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primary-500 hover:bg-slate-800 text-slate-50 dark:text-slate-800 shadow-xl ${className}`}
      {...args}
    />
  );
};

export default ButtonPrimary;
