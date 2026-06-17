import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { authInputClassName } from "@/components/auth/authStyles";

const AuthInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(authInputClassName, className)}
      {...props}
    />
  )
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
