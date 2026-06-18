"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import Button from "@/shared/Button/Button";
import AuthInput from "@/components/auth/AuthInput";
import { useResetPassword } from "@/hooks/useResetPassword";
import {
  authLabelClassName,
  authLinkClassName,
  authPageTitleClassName,
  authPageWrapperClassName,
  authSubmitButtonClassName,
} from "@/components/auth/authStyles";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") || "";
  const login = searchParams.get("login") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword] = useResetPassword();

  const hasValidResetParams = useMemo(() => Boolean(key && login), [key, login]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        variables: {
          key,
          login,
          password,
        },
      });

      setIsSuccess(true);
      toast.success("Password reset successful. You can now log in.");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Invalid or expired reset link. Please request a new one.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nc-PageResetPassword" data-nc-id="PageResetPassword">
      <div className="container mb-24 lg:mb-32">
        <h1 className={authPageTitleClassName}>Reset Password</h1>

        <div className={authPageWrapperClassName}>
          {!hasValidResetParams ? (
            <p className="text-sm text-red-500">
              This reset link is invalid. Please request a new password reset email.
            </p>
          ) : null}

          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className={authLabelClassName}>New password</span>
              <AuthInput
                type="password"
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!hasValidResetParams || isSuccess}
              />
            </label>

            <label className="block">
              <span className={authLabelClassName}>Confirm new password</span>
              <AuthInput
                type="password"
                required={true}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!hasValidResetParams || isSuccess}
              />
            </label>

            <Button
              type="submit"
              disabled={!hasValidResetParams || isLoading || isSuccess}
              className={authSubmitButtonClassName}
              fontSize="text-base font-bold"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin text-header-green" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          {isSuccess ? (
            <p className="text-sm text-header-green">
              Your password has been updated successfully.
            </p>
          ) : null}

          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            <Link href="/login" className={authLinkClassName}>
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="container my-20 text-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
