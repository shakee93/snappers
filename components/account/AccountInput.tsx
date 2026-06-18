import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { accountFormInputClassName } from "@/components/account/accountStyles";

const AccountInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(accountFormInputClassName, className)}
    {...props}
  />
));

AccountInput.displayName = "AccountInput";

export default AccountInput;
