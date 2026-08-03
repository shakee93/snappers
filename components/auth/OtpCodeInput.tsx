"use client";

import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { authInputClassName } from "@/components/auth/authStyles";

type OtpCodeInputProps = {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
};

function digitAt(value: string, index: number): string {
  return value[index] ?? "";
}

const OtpCodeInput = ({
  length,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel = "Verification code",
}: OtpCodeInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!autoFocus) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const writeDigits = (digits: string, startIndex: number) => {
    const cleaned = digits.replace(/\D/g, "");
    if (!cleaned) return;

    const next = value.padEnd(length, " ").split("");
    for (let offset = 0; offset < cleaned.length && startIndex + offset < length; offset += 1) {
      next[startIndex + offset] = cleaned[offset];
    }

    const joined = next.join("").replace(/ /g, "").slice(0, length);
    onChange(joined);
    focusAt(Math.min(startIndex + cleaned.length, length - 1));
  };

  const handleChange = (index: number, raw: string) => {
    // Mobile OTP autofill and some keyboards may dump the whole code into one
    // field — treat multi-character input the same as a paste.
    if (raw.length > 1) {
      writeDigits(raw, index);
      return;
    }

    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = value.padEnd(length, " ").split("");
    next[index] = digit || " ";
    const joined = next.join("").replace(/ /g, "").slice(0, length);
    onChange(joined);

    if (digit && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digitAt(value, index)) {
        const next = value.padEnd(length, " ").split("");
        next[index] = " ";
        onChange(next.join("").replace(/ /g, "").slice(0, length));
        return;
      }
      if (index > 0) {
        const next = value.padEnd(length, " ").split("");
        next[index - 1] = " ";
        onChange(next.join("").replace(/ /g, "").slice(0, length));
        focusAt(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    writeDigits(event.clipboardData.getData("text"), index);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="mt-1.5 flex w-full justify-between gap-2"
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          maxLength={length}
          disabled={disabled}
          value={digitAt(value, index)}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            authInputClassName,
            "mt-0 h-12 w-11 flex-1 px-0 text-center text-lg font-semibold tabular-nums sm:w-12"
          )}
        />
      ))}
    </div>
  );
};

export default OtpCodeInput;
