"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import Button from "@/shared/Button/Button";
import { CREATE_AUTH_NONCE, SIGN_IN_WITH_GOOGLE } from "@/graphql/defs/auth-otp";
import { parseAuthError } from "@/utils/auth-errors";
import { useSession } from "@/context/SessionProvider";
import { getRandomWelcomeMessage } from "@/components/global/forms/HelperComps";
import { getSafeRedirectPath } from "@/utils/redirect";

const GSI_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = {
  credential?: string;
};

type PromptMomentNotification = {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
};

type GoogleIdentityServices = {
  initialize: (config: {
    client_id: string;
    nonce: string;
    callback: (response: GoogleCredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
  cancel: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityServices;
      };
    };
  }
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}

const GoogleSignInButton = ({ clientId }: { clientId: string }) => {
  const nonceRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { applyAuthSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  const [createAuthNonce] = useMutation(CREATE_AUTH_NONCE);
  const [signInWithGoogle] = useMutation(SIGN_IN_WITH_GOOGLE);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const idToken = response.credential;
      const nonce = nonceRef.current;

      if (!idToken || !nonce) {
        setError("Google sign-in did not complete. Please try again.");
        return;
      }

      setError(null);
      setIsSigningIn(true);
      try {
        const { data } = await signInWithGoogle({ variables: { idToken, nonce } });
        const session = data?.signInWithGoogle?.session;

        if (!session?.authToken) {
          setError("Google sign-in did not complete. Please try again.");
          return;
        }

        await applyAuthSession(session);
        toast(getRandomWelcomeMessage());
        localStorage.removeItem("last_order");
        router.push(redirectTo);
      } catch (caught) {
        setError(parseAuthError(caught).message);
      } finally {
        setIsSigningIn(false);
        nonceRef.current = null;
      }
    },
    [applyAuthSession, redirectTo, router, signInWithGoogle]
  );

  const handleClick = useCallback(async () => {
    const identity = window.google?.accounts.id;
    if (!identity || isSigningIn) return;

    setError(null);
    setIsSigningIn(true);

    try {
      // Nonce is single-use and must be minted immediately before the prompt,
      // so a captured token cannot be replayed.
      const { data } = await createAuthNonce();
      const nonce = data?.createAuthNonce?.nonce;
      if (!nonce) {
        setError("Google sign-in is unavailable right now. Please try again.");
        setIsSigningIn(false);
        return;
      }

      nonceRef.current = nonce;
      identity.cancel();
      identity.initialize({
        client_id: clientId,
        nonce,
        callback: handleCredential,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });

      identity.prompt((notification) => {
        if (notification.isDisplayMoment() && notification.isDisplayed()) {
          // Prompt is open — stop the button spinner while the user chooses.
          setIsSigningIn(false);
          return;
        }

        if (notification.isDismissedMoment()) {
          setIsSigningIn(false);
          nonceRef.current = null;
          return;
        }

        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason =
            (notification.isNotDisplayed() && notification.getNotDisplayedReason()) ||
            (notification.isSkippedMoment() && notification.getSkippedReason()) ||
            "unknown";
          setError(
            reason === "opt_out_or_no_session" || reason === "suppressed_by_user"
              ? "Google sign-in was blocked by your browser. Allow third-party sign-in and try again."
              : "Google could not open the sign-in prompt. Check that this site is an authorised origin, then try again."
          );
          setIsSigningIn(false);
          nonceRef.current = null;
        }
      });
    } catch (caught) {
      setError(parseAuthError(caught).message);
      setIsSigningIn(false);
      nonceRef.current = null;
    }
  }, [clientId, createAuthNonce, handleCredential, isSigningIn]);

  return (
    <div className="w-full space-y-2">
      <Script src={GSI_SRC} strategy="afterInteractive" onReady={() => setIsScriptReady(true)} />
      <Button
        type="button"
        disabled={!isScriptReady || isSigningIn}
        onClick={() => {
          void handleClick();
        }}
        className="w-full border border-neutral-200 bg-white text-header-green shadow-md hover:bg-header-cream disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        fontSize="text-base font-bold"
      >
        {isSigningIn ? (
          <Loader className="h-5 w-5 animate-spin text-header-green" />
        ) : (
          <span className="inline-flex items-center gap-3">
            <GoogleMark />
            Continue with Google
          </span>
        )}
      </Button>
      {error ? (
        <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default GoogleSignInButton;
