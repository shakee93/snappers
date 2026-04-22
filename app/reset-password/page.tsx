"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { RESET_USER_PASSWORD } from "@/graphql/defs/auth";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") || "";
  const login = searchParams.get("login") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword] = useMutation(RESET_USER_PASSWORD);

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
        <h2 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 dark:text-neutral-100 md:text-5xl md:leading-[115%]">
          Reset Password
        </h2>

        <div className="mx-auto max-w-md space-y-6">
          {!hasValidResetParams ? (
            <p className="text-sm text-red-500">
              This reset link is invalid. Please request a new password reset email.
            </p>
          ) : null}

          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">New password</span>
              <Input
                type="password"
                required={true}
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!hasValidResetParams || isSuccess}
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">Confirm new password</span>
              <Input
                type="password"
                required={true}
                className="mt-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!hasValidResetParams || isSuccess}
              />
            </label>

            <ButtonPrimary
              type="submit"
              disabled={!hasValidResetParams || isLoading || isSuccess}
            >
              {isLoading ? <Loader className="animate-spin text-gray-100" /> : "Reset password"}
            </ButtonPrimary>
          </form>

          {isSuccess ? (
            <p className="text-sm text-green-600">Your password has been updated successfully.</p>
          ) : null}

          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            <Link href="/login" className="text-green-600">
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
