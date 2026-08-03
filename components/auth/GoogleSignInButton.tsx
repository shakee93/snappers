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
/** GSI's documented max button width. */
const GSI_MAX_WIDTH = 400;

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

const GoogleSignInButton = ({ clientId }: { clientId: string }) => {
  const hostRef = useRef<HTMLDivElement>(null);
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

  // Use renderButton (the supported click-driven path), not prompt()/One Tap.
  // The nonce must exist before initialize, so the button only appears after
  // that round trip. GSI caps width at 400px — we measure the host and pass
  // the largest allowed value without CSS-stretching the iframe.
  useEffect(() => {
    if (!isScriptReady) return;

    let isStale = false;
    let lastWidth = 0;
    let resizeObserver: ResizeObserver | null = null;

    const render = (width: number) => {
      const identity = window.google?.accounts.id;
      const host = hostRef.current;
      if (!identity || !host || !nonceRef.current) return;

      const nextWidth = Math.min(Math.max(Math.floor(width), 200), GSI_MAX_WIDTH);
      if (Math.abs(nextWidth - lastWidth) < 2) return;
      lastWidth = nextWidth;

      host.innerHTML = "";
      identity.renderButton(host, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: nextWidth,
      });
    };

    const initialize = async () => {
      try {
        const { data } = await createAuthNonce();
        const nonce = data?.createAuthNonce?.nonce;
        const identity = window.google?.accounts.id;
        const host = hostRef.current;

        if (isStale || !nonce || !identity || !host) return;

        nonceRef.current = nonce;
        identity.initialize({
          client_id: clientId,
          nonce,
          callback: handleCredential,
          cancel_on_tap_outside: true,
        });

        render(host.clientWidth || host.parentElement?.clientWidth || GSI_MAX_WIDTH);

        resizeObserver = new ResizeObserver((entries) => {
          const nextWidth = entries[0]?.contentRect.width;
          if (nextWidth) render(nextWidth);
        });
        resizeObserver.observe(host);
      } catch (caught) {
        if (!isStale) setError(parseAuthError(caught).message);
      }
    };

    void initialize();

    return () => {
      isStale = true;
      resizeObserver?.disconnect();
      // Dismiss any open One Tap / FedCM prompt so a credential callback
      // cannot fire into an unmounted tree after navigating away.
      window.google?.accounts.id.cancel();
    };
  }, [clientId, createAuthNonce, handleCredential, isScriptReady, nonceAttempt]);

  return (
    <div className="w-full space-y-2">
      <Script src={GSI_SRC} strategy="afterInteractive" onReady={() => setIsScriptReady(true)} />
      <div
        ref={hostRef}
        className="flex w-full justify-center"
        aria-busy={isSigningIn}
      />
      {error ? (
        <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default GoogleSignInButton;
