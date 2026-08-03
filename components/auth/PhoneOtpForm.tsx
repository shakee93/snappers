"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import Button from "@/shared/Button/Button";
import AuthInput from "@/components/auth/AuthInput";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import {
  authLabelClassName,
  authLinkClassName,
  authSubmitButtonClassName,
} from "@/components/auth/authStyles";
import { countries } from "@/data/countries";
import { REQUEST_OTP, VERIFY_OTP } from "@/graphql/defs/auth-otp";
import { isChallengeDead, parseAuthError } from "@/utils/auth-errors";
import { useSession } from "@/context/SessionProvider";
import { getRandomWelcomeMessage } from "@/components/global/forms/HelperComps";
import { getSafeRedirectPath } from "@/utils/redirect";

const DEFAULT_COUNTRY = "LK";
const CODE_LENGTH = 6;
const MIN_NATIONAL_DIGITS = 9;
const MAX_NATIONAL_DIGITS = 12;

type Step = "phone" | "code" | "profile";

type Challenge = {
  challengeId: string;
  expiresAt: number;
  resendAt: number;
};

function nationalDigits(localNumber: string): string {
  return localNumber.replace(/\D/g, "").replace(/^0+/, "");
}

function toE164(countryCode: string, localNumber: string): string {
  const dialCode =
    countries.find((country) => country.code === countryCode)?.callingCode ?? "+94";
  return `+${dialCode.replace(/\D/g, "")}${nationalDigits(localNumber)}`;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const PhoneOtpForm = () => {
  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const { applyAuthSession, updateCustomer } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  const [requestOtp] = useMutation(REQUEST_OTP);
  const [verifyOtp] = useMutation(VERIFY_OTP);

  // Deadlines are absolute so a throttled background tab cannot drift the
  // countdown away from the server's real expiry.
  useEffect(() => {
    if (step !== "code") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);

  const resendIn = useMemo(
    () => (challenge ? Math.max(0, Math.ceil((challenge.resendAt - now) / 1000)) : 0),
    [challenge, now]
  );

  const expiresIn = useMemo(
    () => (challenge ? Math.max(0, Math.ceil((challenge.expiresAt - now) / 1000)) : 0),
    [challenge, now]
  );

  const sendCode = useCallback(
    async (targetPhone: string) => {
      setError(null);
      setIsBusy(true);
      try {
        const { data } = await requestOtp({ variables: { phone: targetPhone } });
        const issued = data?.requestOtp?.challenge;

        if (!issued) {
          setError("We could not send a code just now. Please try again.");
          return false;
        }

        const issuedAt = Date.now();
        setChallenge({
          challengeId: issued.challengeId,
          expiresAt: issuedAt + issued.expiresIn * 1000,
          resendAt: issuedAt + issued.resendAfter * 1000,
        });
        setNow(issuedAt);
        setCode("");
        setStep("code");
        return true;
      } catch (caught) {
        const parsed = parseAuthError(caught);
        setError(parsed.message);
        // Server cooldown may disagree with the client timer — honour it.
        const retryAfter = parsed.retryAfterSeconds;
        if (parsed.code === "RESEND_TOO_SOON" && retryAfter != null && retryAfter > 0) {
          setChallenge((current) =>
            current
              ? {
                  ...current,
                  resendAt: Date.now() + retryAfter * 1000,
                }
              : current
          );
          setNow(Date.now());
        }
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [requestOtp]
  );

  const handlePhoneSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const digits = nationalDigits(localNumber);
      if (digits.length < MIN_NATIONAL_DIGITS || digits.length > MAX_NATIONAL_DIGITS) {
        setError(`Enter a phone number with ${MIN_NATIONAL_DIGITS} to ${MAX_NATIONAL_DIGITS} digits.`);
        return;
      }
      const e164 = toE164(countryCode, localNumber);
      setPhone(e164);
      await sendCode(e164);
    },
    [countryCode, localNumber, sendCode]
  );

  const finishSignIn = useCallback(() => {
    toast(getRandomWelcomeMessage());
    localStorage.removeItem("last_order");
    router.push(redirectTo);
  }, [redirectTo, router]);

  const handleCodeSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!challenge) return;

      setError(null);
      setIsBusy(true);
      try {
        const { data } = await verifyOtp({
          variables: { challengeId: challenge.challengeId, code },
        });
        const verified = data?.verifyOtp;

        if (!verified?.session?.authToken) {
          setError("We could not complete sign-in. Please request a new code.");
          return;
        }

        await applyAuthSession(verified.session);

        if (verified.isNewUser) {
          setStep("profile");
          return;
        }

        finishSignIn();
      } catch (caught) {
        const parsed = parseAuthError(caught);
        setError(parsed.message);
        if (isChallengeDead(parsed.code)) {
          setChallenge(null);
          setCode("");
          setStep("phone");
        }
      } finally {
        setIsBusy(false);
      }
    },
    [applyAuthSession, challenge, code, finishSignIn, verifyOtp]
  );

  // The verified number is the only detail an OTP signup arrives with, and the
  // auth plugin does not write it to the WooCommerce billing record.
  const saveProfile = useCallback(
    async (withDetails: boolean) => {
      setIsBusy(true);
      setError(null);
      try {
        const result = await updateCustomer(
          withDetails
            ? {
                firstName,
                email,
                billing: { firstName, email, phone },
              }
            : { billing: { phone } }
        );

        // Skip always navigates; a failed name/email write must stay on the
        // profile step so the user can fix it (e.g. email already taken).
        if (withDetails && result?.error) {
          setError(result.error);
          return;
        }

        finishSignIn();
      } finally {
        setIsBusy(false);
      }
    },
    [email, finishSignIn, firstName, phone, updateCustomer]
  );

  const handleProfileSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      await saveProfile(true);
    },
    [saveProfile]
  );

  const handleSkipProfile = useCallback(() => {
    void saveProfile(false);
  }, [saveProfile]);

  const handleChangeNumber = useCallback(() => {
    setStep("phone");
    setChallenge(null);
    setCode("");
    setError(null);
  }, []);

  const handleResend = useCallback(() => {
    void sendCode(phone);
  }, [phone, sendCode]);

  if (step === "profile") {
    return (
      <form className="grid grid-cols-1 gap-6" onSubmit={handleProfileSubmit}>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Welcome! Tell us who you are so we can address you properly and send your
          order confirmations.
        </p>
        <label className="block">
          <span className={authLabelClassName}>Your name</span>
          <AuthInput
            type="text"
            autoComplete="given-name"
            placeholder="Ada"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </label>
        <label className="block">
          <span className={authLabelClassName}>Email address</span>
          <AuthInput
            type="email"
            autoComplete="email"
            placeholder="example@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={isBusy}
          className={authSubmitButtonClassName}
          fontSize="text-base font-bold"
        >
          {isBusy ? <Loader className="h-5 w-5 animate-spin text-header-green" /> : "Save and continue"}
        </Button>
        <button
          type="button"
          onClick={handleSkipProfile}
          disabled={isBusy}
          className="text-sm text-neutral-500 hover:underline disabled:opacity-60 dark:text-neutral-400"
        >
          Skip for now
        </button>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form className="grid grid-cols-1 gap-6" onSubmit={handleCodeSubmit}>
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            We sent a {CODE_LENGTH}-digit code to{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{phone}</span>.
          </p>
          <button
            type="button"
            onClick={handleChangeNumber}
            className={`mt-1 text-sm ${authLinkClassName}`}
          >
            Use a different number
          </button>
        </div>

        <div>
          <span className={authLabelClassName}>Verification code</span>
          <OtpCodeInput
            length={CODE_LENGTH}
            value={code}
            onChange={setCode}
            disabled={isBusy || expiresIn === 0}
            autoFocus
          />
          <span className="mt-1.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {expiresIn > 0
              ? `Code expires in ${formatCountdown(expiresIn)}`
              : "This code has expired. Request a new one."}
          </span>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isBusy || code.length < CODE_LENGTH || expiresIn === 0}
          className={authSubmitButtonClassName}
          fontSize="text-base font-bold"
        >
          {isBusy ? <Loader className="h-5 w-5 animate-spin text-header-green" /> : "Verify and continue"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isBusy || resendIn > 0}
          className="text-sm text-neutral-500 hover:underline disabled:opacity-60 dark:text-neutral-400"
        >
          {resendIn > 0 ? `Resend code in ${formatCountdown(resendIn)}` : "Resend code"}
        </button>
      </form>
    );
  }

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handlePhoneSubmit}>
      <div>
        <span className={authLabelClassName}>Phone number</span>
        <div className="mt-1.5 flex gap-2">
          <select
            aria-label="Country calling code"
            className="h-11 w-28 rounded-lg border-0 bg-header-cream px-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-header-action/40 dark:bg-neutral-800 dark:text-neutral-100"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.callingCode}
              </option>
            ))}
          </select>
          <AuthInput
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="77 123 4567"
            className="mt-0 flex-1"
            required
            value={localNumber}
            onChange={(event) => setLocalNumber(event.target.value)}
          />
        </div>
        <span className="mt-1.5 block text-xs text-neutral-500 dark:text-neutral-400">
          We&apos;ll text you a code. No password needed.
        </span>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isBusy}
        className={authSubmitButtonClassName}
        fontSize="text-base font-bold"
      >
        {isBusy ? <Loader className="h-5 w-5 animate-spin text-header-green" /> : "Send code"}
      </Button>
    </form>
  );
};

export default PhoneOtpForm;
