"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Button from "@/shared/Button/Button";
import AuthInput from "@/components/auth/AuthInput";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import {
  authLabelClassName,
  authLinkClassName,
  authPageTitleClassName,
  authPageWrapperClassName,
  authSubmitButtonClassName,
} from "@/components/auth/authStyles";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [sendResetEmail] = useForgotPassword();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await sendResetEmail({
        variables: {
          username: email.trim(),
        },
      });

      setIsSubmitted(true);
      toast.success("Check your email for a password reset link if the account exists.");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Unable to process your request right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nc-PageForgotPassword" data-nc-id="PageForgotPassword">
      <div className="container mb-24 lg:mb-32">
        <h1 className={authPageTitleClassName}>Forgot Password</h1>

        <div className={authPageWrapperClassName}>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Enter your email address and we will send you a password reset link.
          </p>

          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className={authLabelClassName}>Email address</span>
              <AuthInput
                type="email"
                placeholder="example@example.com"
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <Button
              type="submit"
              disabled={isLoading}
              className={authSubmitButtonClassName}
              fontSize="text-base font-bold"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin text-header-green" />
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          {isSubmitted ? (
            <p className="text-sm text-header-green">
              Check your inbox and spam folder for the reset email.
            </p>
          ) : null}

          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            Remembered your password?{" "}
            <Link href="/login" className={authLinkClassName}>
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
