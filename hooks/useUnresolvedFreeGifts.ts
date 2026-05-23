"use client";

import { useEffect, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  GET_PRODUCT_BY_DATABASE_ID,
  GET_PRODUCT_VARIATION_BY_DATABASE_ID,
} from "@/graphql/defs/products";

export type ResolvedFreeGift = {
  id: number;
  databaseId?: number;
  name: string;
  slug?: string;
  brandSlug?: string;
  imageUrl?: string;
  href?: string;
};

type ResolvedSource = {
  databaseId?: number | null;
  name?: string | null;
  slug?: string | null;
  brands?: { nodes?: ({ slug?: string | null } | null)[] | null } | null;
  image?: { sourceUrl?: string | null } | null;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
};

function toResolved(id: number, source: ResolvedSource | null | undefined): ResolvedFreeGift | null {
  if (!source?.name) return null;
  const brandSlug = source.brands?.nodes?.[0]?.slug ?? undefined;
  const slug = source.slug ?? undefined;
  const href = brandSlug && slug ? `/${brandSlug}/${slug}` : undefined;
  const imageUrl =
    source.image?.sourceUrl ||
    source.featuredImage?.node?.sourceUrl ||
    undefined;
  return {
    id,
    databaseId: source.databaseId ?? undefined,
    name: source.name,
    slug,
    brandSlug,
    imageUrl,
    href,
  };
}

/**
 * Resolves a list of BOGO free-gift IDs concurrently. Each ID can be a Product
 * or a ProductVariation; we fire both lookups in parallel and prefer the
 * product result, falling back to the variation's parent for naming/linking.
 * Returns only the IDs that actually resolved so callers can hide their
 * containers when nothing is available.
 */
export function useUnresolvedFreeGifts(ids: number[]): {
  resolved: ResolvedFreeGift[];
  loading: boolean;
} {
  const client = useApolloClient();
  const key = useMemo(() => ids.join(","), [ids]);
  const [state, setState] = useState<{
    key: string;
    resolved: ResolvedFreeGift[];
    loading: boolean;
  }>({ key: "", resolved: [], loading: false });

  useEffect(() => {
    if (!ids.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ key, resolved: [], loading: false });
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, key, loading: true }));

    Promise.all(
      ids.map(async (id): Promise<ResolvedFreeGift | null> => {
        const [productResult, variationResult] = await Promise.all([
          client
            .query({
              query: GET_PRODUCT_BY_DATABASE_ID,
              variables: { id: String(id) },
              fetchPolicy: "cache-first",
            })
            .catch(() => null),
          client
            .query({
              query: GET_PRODUCT_VARIATION_BY_DATABASE_ID,
              variables: { id: String(id) },
              fetchPolicy: "cache-first",
            })
            .catch(() => null),
        ]);

        const productResolved = toResolved(
          id,
          productResult?.data?.product as ResolvedSource | null | undefined
        );
        if (productResolved) return productResolved;

        return toResolved(
          id,
          variationResult?.data?.productVariation?.parent?.node as
            | ResolvedSource
            | null
            | undefined
        );
      })
    ).then((items) => {
      if (cancelled) return;
      setState({
        key,
        resolved: items.filter((x): x is ResolvedFreeGift => !!x),
        loading: false,
      });
    });

    return () => {
      cancelled = true;
    };
    // `key` is a content hash of `ids`, so depending on `key` correctly
    // re-runs when the ID set changes without churning on new array identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key]);

  return { resolved: state.resolved, loading: state.loading };
}
