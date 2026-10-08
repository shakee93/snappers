import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// These documents are hand-typed rather than generated because the backend has
// public GraphQL introspection disabled, so `npm run codegen` cannot read the
// Extended User Signup half of the schema. Every field below was validated
// against the live endpoint. Once introspection is enabled, regenerate and
// import the typed documents from `graphql/types/gql` like the rest of the app.
// Excluded from the codegen documents glob in codegen.ts for the same reason.

export type AuthProviderName = "PHONE" | "GOOGLE" | "APPLE";

export type AuthProviderStatus = {
  provider: AuthProviderName;
  enabled: boolean;
  /** Public client ID for the provider's own SDK. Null for PHONE. */
  clientId: string | null;
};

export type AuthProvidersQuery = {
  authProviders: AuthProviderStatus[] | null;
};

export const AUTH_PROVIDERS = gql`
  query AuthProviders {
    authProviders {
      provider
      enabled
      clientId
    }
  }
` as TypedDocumentNode<AuthProvidersQuery, Record<string, never>>;

export type OtpChallenge = {
  challengeId: string;
  expiresIn: number;
  resendAfter: number;
};

export type RequestOtpMutation = {
  requestOtp: {
    challenge: OtpChallenge | null;
  } | null;
};

export type RequestOtpVariables = {
  phone: string;
};

export const REQUEST_OTP = gql`
  mutation RequestOtp($phone: String!) {
    requestOtp(input: { phone: $phone, purpose: AUTH }) {
      challenge {
        challengeId
        expiresIn
        resendAfter
      }
    }
  }
` as TypedDocumentNode<RequestOtpMutation, RequestOtpVariables>;

/**
 * Sign-in payloads carry no WooCommerce session token - this is a
 * WordPress-user API. The guest `woocommerce-session` token must be kept and
 * sent alongside the new Bearer token so WooCommerce links the guest cart to
 * the account.
 */
export type AuthSessionTokens = {
  authToken: string;
  refreshToken: string | null;
  expiresIn: number;
};

export type VerifyOtpMutation = {
  verifyOtp: {
    isNewUser: boolean;
    userId: number;
    session: AuthSessionTokens | null;
  } | null;
};

export type VerifyOtpVariables = {
  challengeId: string;
  code: string;
};

export const VERIFY_OTP = gql`
  mutation VerifyOtp($challengeId: String!, $code: String!) {
    verifyOtp(input: { challengeId: $challengeId, code: $code }) {
      isNewUser
      userId
      session {
        authToken
        refreshToken
        expiresIn
      }
    }
  }
` as TypedDocumentNode<VerifyOtpMutation, VerifyOtpVariables>;

/**
 * Single-use, and it must reach the provider SDK so it comes back inside the
 * signed ID token - otherwise a captured token could be replayed until it
 * expires. The schema marks `nonce` optional on the sign-in mutations; treat it
 * as mandatory regardless.
 */
export type CreateAuthNonceMutation = {
  createAuthNonce: {
    nonce: string;
    expiresIn: number;
  } | null;
};

export const CREATE_AUTH_NONCE = gql`
  mutation CreateAuthNonce {
    createAuthNonce(input: {}) {
      nonce
      expiresIn
    }
  }
` as TypedDocumentNode<CreateAuthNonceMutation, Record<string, never>>;

export type SignInWithGoogleMutation = {
  signInWithGoogle: {
    isNewUser: boolean;
    userId: number;
    session: AuthSessionTokens | null;
  } | null;
};

export type SignInWithGoogleVariables = {
  idToken: string;
  nonce: string;
};

export const SIGN_IN_WITH_GOOGLE = gql`
  mutation SignInWithGoogle($idToken: String!, $nonce: String!) {
    signInWithGoogle(input: { idToken: $idToken, nonce: $nonce }) {
      isNewUser
      userId
      session {
        authToken
        refreshToken
        expiresIn
      }
    }
  }
` as TypedDocumentNode<SignInWithGoogleMutation, SignInWithGoogleVariables>;
