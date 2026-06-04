"use client";

import { useMutation } from "@apollo/client";
import { SEND_PASSWORD_RESET_EMAIL } from "@/graphql/defs/auth";

/** Send a password-reset email to the given username/email. */
export function useForgotPassword() {
  return useMutation(SEND_PASSWORD_RESET_EMAIL);
}
