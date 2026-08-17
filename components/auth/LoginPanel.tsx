"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Loader } from "lucide-react";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { AUTH_PROVIDERS } from "@/graphql/defs/auth-otp";

const LoginPanel = () => {
  const { data, error } = useQuery(AUTH_PROVIDERS);

  const providersResolved = data !== undefined || !!error;

  // A provider can be switched off, or on but unconfigured. Asking the server
  // avoids offering a sign-in method that would always fail.
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

  if (!providersResolved) {
    return (
      <div className="flex justify-center py-12" aria-busy="true" aria-label="Loading sign-in options">
        <Loader className="h-6 w-6 animate-spin text-header-green" />
      </div>
    );
  }

  if (!phoneEnabled && !googleClientId) {
    return (
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Sign-in is temporarily unavailable. Please try again later.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {phoneEnabled ? <PhoneOtpForm /> : null}

      {googleClientId ? (
        <>
          {phoneEnabled ? (
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
              <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                or
              </span>
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            </div>
          ) : null}
          <GoogleSignInButton clientId={googleClientId} />
        </>
      ) : null}
    </div>
  );
};

export default LoginPanel;
