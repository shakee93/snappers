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

const OtpCodeInput = ({
  length,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel = "Verification code",
}: OtpCodeInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  // value is always a contiguous digit string (no gaps). Digits only fill
  // boxes 0..value.length; typing into a later box is ignored so a mis-click
  // cannot land a digit in the wrong place.
  const digits = value.replace(/\D/g, "").slice(0, length);

  useEffect(() => {
    if (!autoFocus) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const writeFrom = (startIndex: number, incoming: string) => {
    const cleaned = incoming.replace(/\D/g, "");
    if (!cleaned) return;

    // Full-code paste/autofill always replaces from the start.
    if (cleaned.length >= length || startIndex === 0) {
      const next = cleaned.slice(0, length);
      onChange(next);
      focusAt(Math.min(next.length, length - 1));
      return;
    }

    // Only accept input at the next empty box or an already-filled box.
    if (startIndex > digits.length) {
      focusAt(digits.length);
      return;
    }

    const next = (digits.slice(0, startIndex) + cleaned).slice(0, length);
    onChange(next);
    focusAt(Math.min(startIndex + cleaned.length, length - 1));
  };

  const handleChange = (index: number, raw: string) => {
    if (raw.length > 1) {
      writeFrom(index, raw);
      return;
    }

    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      onChange(digits.slice(0, index) + digits.slice(index + 1));
      return;
    }

    if (index > digits.length) {
      focusAt(digits.length);
      return;
    }

    const next = (digits.slice(0, index) + digit + digits.slice(index + 1)).slice(
      0,
      length
    );
    onChange(next);
    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        onChange(digits.slice(0, index) + digits.slice(index + 1));
        return;
      }
      if (index > 0) {
        onChange(digits.slice(0, index - 1) + digits.slice(index));
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
    writeFrom(index, event.clipboardData.getData("text"));
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
          value={digits[index] ?? ""}
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
