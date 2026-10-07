import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";
import { cn } from "@/lib/utils";
import { BRAND_CTA_BUTTON_CLASS } from "@/shared/Button/ButtonBrand";

export interface ButtonPrimaryProps extends ButtonProps {}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  className = "",
  fontSize = "text-sm sm:text-base font-bold",
  ...args
}) => {
  return (
    <Button
      className={cn("ttnc-ButtonPrimary", BRAND_CTA_BUTTON_CLASS, className)}
      fontSize={fontSize}
      {...args}
    />
  );
};

export default ButtonPrimary;
