"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { authLinkClassName } from "@/components/auth/authStyles";
import { AUTH_PROVIDERS } from "@/graphql/defs/auth-otp";

type Mode = "phone" | "email";

const LoginPanel = () => {
  const { data, loading, error } = useQuery(AUTH_PROVIDERS);
  const [chosenMode, setChosenMode] = useState<Mode | null>(null);

  // A provider can be switched off, or on but unconfigured. Asking the server
  // avoids offering a sign-in method that would always fail. On error or while
  // loading, fall through to email so the form is usable immediately.
  const phoneEnabled = useMemo(
    () =>
      !error &&
      (data?.authProviders?.some(
        (provider) => provider.provider === "PHONE" && provider.enabled
      ) ?? false),
    [data, error]
  );

  const googleClientId = useMemo(
    () =>
      error
        ? null
        : data?.authProviders?.find(
            (provider) => provider.provider === "GOOGLE" && provider.enabled
          )?.clientId ?? null,
    [data, error]
  );

  // Until providers resolve, show email so cold loads aren't blocked.
  const mode: Mode =
    chosenMode ?? (loading || error ? "email" : phoneEnabled ? "phone" : "email");

  return (
    <div className="space-y-6">
      {mode === "phone" ? <PhoneOtpForm /> : <LoginForm />}

      {googleClientId ? (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              or
            </span>
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <GoogleSignInButton clientId={googleClientId} />
        </>
      ) : null}

      {phoneEnabled ? (
        <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
          <button
            type="button"
            onClick={() => setChosenMode(mode === "phone" ? "email" : "phone")}
            className={authLinkClassName}
          >
            {mode === "phone" ? "Sign in with email instead" : "Sign in with your phone instead"}
          </button>
        </p>
      ) : null}

      {mode === "email" ? (
        <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
          New user?{" "}
          <Link className={authLinkClassName} href="/signup">
            Create an account
          </Link>
        </p>
      ) : null}
    </div>
  );
};

export default LoginPanel;
