"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useForgotPassword } from "@/hooks/useForgotPassword";

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
        <h2 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 dark:text-neutral-100 md:text-5xl md:leading-[115%]">
          Forgot Password
        </h2>

        <div className="mx-auto max-w-md space-y-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Enter your email address and we will send you a password reset link.
          </p>

          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">Email address</span>
              <Input
                type="email"
                placeholder="example@example.com"
                required={true}
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <ButtonPrimary type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin text-gray-100" /> : "Send reset link"}
            </ButtonPrimary>
          </form>

          {isSubmitted ? (
            <p className="text-sm text-green-600">
              Check your inbox and spam folder for the reset email.
            </p>
          ) : null}

          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            Remembered your password?{" "}
            <Link href="/login" className="text-green-600">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
