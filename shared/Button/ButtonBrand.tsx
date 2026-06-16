import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";

/** Shared Catlitter CTA — lime fill, dark-green label. */
export const BRAND_CTA_BUTTON_CLASS =
  "bg-header-action text-header-green shadow-none hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";

export interface ButtonBrandProps extends ButtonProps {}

const ButtonBrand: React.FC<ButtonBrandProps> = ({
  className = "",
  fontSize = "text-sm sm:text-base font-bold",
  ...args
}) => {
  return (
    <Button
      className={`ttnc-ButtonBrand ${BRAND_CTA_BUTTON_CLASS} ${className}`}
      fontSize={fontSize}
      {...args}
    />
  );
};

export default ButtonBrand;
