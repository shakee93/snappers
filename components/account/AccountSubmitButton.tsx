import Button, { ButtonProps } from "@/shared/Button/Button";
import { cn } from "@/lib/utils";
import { accountSubmitButtonClassName } from "@/components/account/accountStyles";

const AccountSubmitButton = ({ className = "", ...props }: ButtonProps) => (
  <Button
    className={cn(accountSubmitButtonClassName, className)}
    fontSize="text-sm font-bold sm:text-base"
    {...props}
  />
);

export default AccountSubmitButton;
