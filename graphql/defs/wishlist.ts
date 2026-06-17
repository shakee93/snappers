import { gql } from "@apollo/client";

// These operations are served by the `headless-wishlist.php` mu-plugin on the
// WordPress backend (YITH bridge). They are user-scoped — the backend resolves
// the customer from the JWT — and intentionally NOT in the Smart Cache
// allowlist, so every request hits the backend fresh.
//
// Codegen can't introspect this endpoint (introspection is disabled), so these
// use the untyped `@apollo/client` gql tag with the hand-written result types
// below, mirroring the product-reviews defs.

export const GET_WISHLIST = gql`
  query GetWishlist {
    wishlist
  }
`;

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($productId: Int!) {
    addToWishlist(input: { productId: $productId }) {
      added
      wishlist
    }
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: Int!) {
    removeFromWishlist(input: { productId: $productId }) {
      removed
      wishlist
    }
  }
`;

export type GetWishlistResult = {
  wishlist?: (number | null)[] | null;
};

export type AddToWishlistResult = {
  addToWishlist?: {
    added?: boolean | null;
    wishlist?: (number | null)[] | null;
  } | null;
};

export type RemoveFromWishlistResult = {
  removeFromWishlist?: {
    removed?: boolean | null;
    wishlist?: (number | null)[] | null;
  } | null;
};
