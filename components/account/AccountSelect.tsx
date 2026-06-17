import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { accountSelectClassName } from "@/components/account/accountStyles";

const AccountSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(accountSelectClassName, className)}
    {...props}
  >
    {children}
  </select>
));

AccountSelect.displayName = "AccountSelect";

export default AccountSelect;
