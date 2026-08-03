"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
/** GSI's documented max button width. */
const GSI_MAX_WIDTH = 400;
/** GSI `size: "large"` renders at 40px — match the placeholder to it. */
const GSI_BUTTON_HEIGHT_CLASS = "h-10 py-0";

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

type GoogleSignInButtonProps = {
  clientId: string;
};

const GoogleSignInButton = ({ clientId }: GoogleSignInButtonProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<string | null>(null);
  const nonceExpiresAtRef = useRef(0);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWidthRef = useRef(0);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);
  const ensureButtonRef = useRef<() => Promise<boolean>>(async () => false);
  // Keep the credential handler stable so unrelated SessionProvider /
  // CartProvider updates do not tear down and remint the GSI button.
  const credentialRef = useRef<(response: GoogleCredentialResponse) => void>(
    () => undefined
  );

  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isButtonReady, setIsButtonReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        if (mountedRef.current) setIsSigningIn(false);
      }
    },
    [applyAuthSession, redirectTo, router, signInWithGoogle]
  );

  useEffect(() => {
    credentialRef.current = (response) => {
      void handleCredential(response);
    };
  }, [handleCredential]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      window.google?.accounts.id.cancel();
    };
  }, []);

  useEffect(() => {
    if (nonceAttempt === 0) return;
    nonceRef.current = null;
    nonceExpiresAtRef.current = 0;
    lastWidthRef.current = 0;
    initializingRef.current = false;
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    setIsButtonReady(false);
    if (hostRef.current) hostRef.current.innerHTML = "";
  }, [nonceAttempt]);

  const paintButton = useCallback((width: number) => {
    const identity = window.google?.accounts.id;
    const host = hostRef.current;
    if (!identity || !host || !nonceRef.current) return;

    const nextWidth = Math.min(Math.max(Math.floor(width), 200), GSI_MAX_WIDTH);
    if (Math.abs(nextWidth - lastWidthRef.current) < 2 && host.childElementCount > 0) {
      return;
    }
    lastWidthRef.current = nextWidth;

    host.innerHTML = "";
    identity.renderButton(host, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      width: nextWidth,
    });
    setIsButtonReady(true);
  }, []);

  const scheduleExpiryRemint = useCallback((expiresInSeconds: number) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    // Remint before the nonce TTL so an idle tab does not fail the first click.
    const remintInMs = Math.max((expiresInSeconds - 30) * 1000, 5_000);
    expiryTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      nonceRef.current = null;
      nonceExpiresAtRef.current = 0;
      lastWidthRef.current = 0;
      // Remint in the background while the button stays mounted — do not tear
      // it down under the cursor.
      void ensureButtonRef.current();
    }, remintInMs);
  }, []);

  const ensureButton = useCallback(async () => {
    if (!isScriptReady || !mountedRef.current) return false;

    const identity = window.google?.accounts.id;
    const host = hostRef.current;
    const wrapper = wrapperRef.current;
    if (!identity || !host) return false;

    const nonceStillValid =
      !!nonceRef.current && Date.now() < nonceExpiresAtRef.current - 15_000;

    if (nonceStillValid && host.childElementCount > 0) {
      setIsButtonReady(true);
      return true;
    }

    if (initializingRef.current) return false;
    initializingRef.current = true;
    setIsPreparing(true);

    try {
      const { data } = await createAuthNonce();
      const payload = data?.createAuthNonce;
      if (!mountedRef.current || !payload?.nonce) return false;

      nonceRef.current = payload.nonce;
      nonceExpiresAtRef.current = Date.now() + payload.expiresIn * 1000;

      identity.initialize({
        client_id: clientId,
        nonce: payload.nonce,
        callback: (response) => credentialRef.current(response),
        cancel_on_tap_outside: true,
      });

      // Measure the visible wrapper — the host may still be `invisible`.
      const width =
        wrapper?.clientWidth || host.clientWidth || host.parentElement?.clientWidth || GSI_MAX_WIDTH;
      paintButton(width);
      scheduleExpiryRemint(payload.expiresIn);
      return true;
    } catch (caught) {
      if (mountedRef.current) setError(parseAuthError(caught).message);
      return false;
    } finally {
      initializingRef.current = false;
      if (mountedRef.current) setIsPreparing(false);
    }
  }, [clientId, createAuthNonce, isScriptReady, paintButton, scheduleExpiryRemint]);

  ensureButtonRef.current = ensureButton;

  // Arm once on first user interaction anywhere in the panel (or when the
  // browser is idle), so bounced visitors never mint a nonce and anyone who
  // reaches for the button finds it already live — including on touch.
  useEffect(() => {
    if (!isScriptReady) return;

    let armed = false;

    const teardown = () => {
      window.removeEventListener("pointerdown", arm, true);
      window.removeEventListener("keydown", arm, true);
      window.removeEventListener("touchstart", arm, true);
      window.removeEventListener("scroll", arm, true);
    };

    const arm = () => {
      if (armed) return;
      armed = true;
      teardown();
      void ensureButton();
    };

    window.addEventListener("pointerdown", arm, true);
    window.addEventListener("keydown", arm, true);
    window.addEventListener("touchstart", arm, true);
    window.addEventListener("scroll", arm, true);

    let idleHandle: number | ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(arm, { timeout: 2500 });
    } else {
      idleHandle = setTimeout(arm, 1200);
    }

    return () => {
      teardown();
      if (typeof idleHandle === "number" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      } else if (idleHandle !== undefined) {
        clearTimeout(idleHandle);
      }
    };
  }, [ensureButton, isScriptReady, nonceAttempt]);

  useEffect(() => {
    if (!isScriptReady || !isButtonReady) return;

    const host = hostRef.current;
    if (!host) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!nonceRef.current || !host.childElementCount) return;
      const nextWidth = entries[0]?.contentRect.width;
      if (nextWidth) paintButton(nextWidth);
    });
    resizeObserver.observe(host);
    return () => resizeObserver.disconnect();
  }, [isButtonReady, isScriptReady, paintButton]);

  return (
    <div ref={wrapperRef} className="w-full space-y-2">
      <Script src={GSI_SRC} strategy="afterInteractive" onReady={() => setIsScriptReady(true)} />
      <div
        className={`relative w-full ${isSigningIn ? "pointer-events-none opacity-60" : ""}`}
      >
        {!isButtonReady ? (
          <Button
            type="button"
            disabled={!isScriptReady || isPreparing || isSigningIn}
            onClick={() => {
              void ensureButton();
            }}
            className="w-full border border-neutral-200 bg-white text-header-green shadow-md hover:bg-header-cream disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            sizeClass={GSI_BUTTON_HEIGHT_CLASS}
            fontSize="text-sm font-bold"
          >
            {isPreparing ? (
              <Loader className="h-5 w-5 animate-spin text-header-green" />
            ) : (
              <span className="inline-flex items-center gap-3">
                <GoogleMark />
                Continue with Google
              </span>
            )}
          </Button>
        ) : null}

        {/* `invisible` keeps layout width measurable before the first paint. */}
        <div
          ref={hostRef}
          className={`flex w-full justify-center ${isButtonReady ? "" : "invisible absolute inset-x-0 top-0"}`}
          aria-busy={isSigningIn}
        />

        {isSigningIn ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader className="h-5 w-5 animate-spin text-header-green" />
          </div>
        ) : null}
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
