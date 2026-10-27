import { ApolloError } from "@apollo/client";

/**
 * The auth API prefixes every `errors[].message` with a machine-readable code
 * (`OTP_INVALID: That code is not valid.`). GRAPHQL_DEBUG is off in production,
 * so the prefix is the only reliable signal - never match on the sentence.
 */
export const AUTH_ERROR_CODES = [
  "PHONE_INVALID",
  "COUNTRY_NOT_ALLOWED",
  "OTP_INVALID",
  "OTP_EXPIRED",
  "OTP_ATTEMPTS_EXCEEDED",
  "RESEND_TOO_SOON",
  "RATE_LIMITED",
  "DAILY_CAP_REACHED",
  "SMS_UNAVAILABLE",
  "SMS_SEND_FAILED",
  "INVALID_TOKEN",
  "PROVIDER_DISABLED",
  "LINK_CONFLICT",
  "SESSION_BACKEND_UNAVAILABLE",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export type ParsedAuthError = {
  code: AuthErrorCode | "UNKNOWN";
  message: string;
  retryAfterSeconds: number | null;
};

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const KNOWN_CODES: ReadonlySet<string> = new Set(AUTH_ERROR_CODES);

const CODE_PREFIX = /^([A-Z][A-Z0-9_]*):\s*([\s\S]*)$/;

function extractMessage(error: unknown): string {
  if (error instanceof ApolloError) {
    return error.graphQLErrors[0]?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

function extractRetryAfterSeconds(code: string, text: string): number | null {
  if (code !== "RESEND_TOO_SOON" && code !== "RATE_LIMITED") return null;
  const seconds = /(\d+)/.exec(text);
  return seconds ? Number(seconds[1]) : null;
}

export function parseAuthError(error: unknown): ParsedAuthError {
  const raw = extractMessage(error).trim();
  const match = CODE_PREFIX.exec(raw);

  if (!match) {
    return { code: "UNKNOWN", message: raw || GENERIC_MESSAGE, retryAfterSeconds: null };
  }

  const [, code, text] = match;
  const trimmed = text.trim();

  return {
    code: KNOWN_CODES.has(code) ? (code as AuthErrorCode) : "UNKNOWN",
    message: trimmed || GENERIC_MESSAGE,
    retryAfterSeconds: extractRetryAfterSeconds(code, trimmed),
  };
}

/**
 * Codes that burn the challenge server-side - the entered code can never
 * succeed, so the user has to request a fresh one.
 */
export function isChallengeDead(code: ParsedAuthError["code"]): boolean {
  return code === "OTP_EXPIRED" || code === "OTP_ATTEMPTS_EXCEEDED";
}
