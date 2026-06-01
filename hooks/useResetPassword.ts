"use client";

import { useMutation } from "@apollo/client";
import { RESET_USER_PASSWORD } from "@/graphql/defs/auth";

/** Reset a user's password with a key + login from the reset email link. */
export function useResetPassword() {
  return useMutation(RESET_USER_PASSWORD);
}
