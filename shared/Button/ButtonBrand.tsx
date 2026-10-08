import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";

/** Snappers primary CTA - navy fill, yellow Inter label (checkout, shop, auth, etc.). */
export const BRAND_CTA_BUTTON_CLASS =
  "bg-header-green font-[family-name:var(--font-inter)] text-[#FACC15] shadow-none hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";

/** Compact pill for product cards and inline actions. */
export const BRAND_CTA_BUTTON_COMPACT_CLASS = `${BRAND_CTA_BUTTON_CLASS} rounded-full font-bold`;

export interface ButtonBrandProps extends ButtonProps {}

const ButtonBrand: React.FC<ButtonBrandProps> = ({
  className = "",
  fontSize = "font-[family-name:var(--font-inter)] text-sm sm:text-base font-bold",
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
