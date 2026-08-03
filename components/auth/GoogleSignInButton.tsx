"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { CREATE_AUTH_NONCE, SIGN_IN_WITH_GOOGLE } from "@/graphql/defs/auth-otp";
import { parseAuthError } from "@/utils/auth-errors";
import { useSession } from "@/context/SessionProvider";
import { getRandomWelcomeMessage } from "@/components/global/forms/HelperComps";
import { getSafeRedirectPath } from "@/utils/redirect";

const GSI_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentityServices = {
  initialize: (config: {
    client_id: string;
    nonce: string;
    callback: (response: GoogleCredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme: "outline" | "filled_blue" | "filled_black";
      size: "small" | "medium" | "large";
      text?: "signin_with" | "signup_with" | "continue_with";
      shape?: "rectangular" | "pill";
      logo_alignment?: "left" | "center";
      width?: number;
    }
  ) => void;
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

const GoogleSignInButton = ({ clientId }: { clientId: string }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A nonce is single-use, so a failed attempt needs a fresh one before the
  // button can be offered again.
  const [nonceAttempt, setNonceAttempt] = useState(0);

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
        setNonceAttempt((attempt) => attempt + 1);
        return;
      }

      setError(null);
      setIsSigningIn(true);
      try {
        const { data } = await signInWithGoogle({ variables: { idToken, nonce } });
        const session = data?.signInWithGoogle?.session;

        if (!session?.authToken) {
          setError("Google sign-in did not complete. Please try again.");
          setNonceAttempt((attempt) => attempt + 1);
          return;
        }

        await applyAuthSession(session);
        toast(getRandomWelcomeMessage());
        localStorage.removeItem("last_order");
        router.push(redirectTo);
      } catch (caught) {
        setError(parseAuthError(caught).message);
        setNonceAttempt((attempt) => attempt + 1);
      } finally {
        setIsSigningIn(false);
      }
    },
    [applyAuthSession, redirectTo, router, signInWithGoogle]
  );

  // The nonce has to exist before Google is initialized, so the button can only
  // be rendered after that round trip completes.
  useEffect(() => {
    if (!isScriptReady) return;

    let isStale = false;

    const initialize = async () => {
      try {
        const { data } = await createAuthNonce();
        const nonce = data?.createAuthNonce?.nonce;
        const identity = window.google?.accounts.id;

        if (isStale || !nonce || !identity || !buttonRef.current) return;

        nonceRef.current = nonce;
        identity.initialize({
          client_id: clientId,
          nonce,
          callback: handleCredential,
          cancel_on_tap_outside: true,
        });
        identity.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
        });
      } catch (caught) {
        if (!isStale) setError(parseAuthError(caught).message);
      }
    };

    void initialize();

    return () => {
      isStale = true;
    };
  }, [clientId, createAuthNonce, handleCredential, isScriptReady, nonceAttempt]);

  return (
    <div className="space-y-2">
      <Script src={GSI_SRC} strategy="afterInteractive" onReady={() => setIsScriptReady(true)} />
      <div className="flex justify-center">
        <div ref={buttonRef} aria-busy={isSigningIn} />
      </div>
      {error ? (
        <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default GoogleSignInButton;
