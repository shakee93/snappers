"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import { findBogoEnabledVariation, resolveBogoConfig } from "@/lib/bogo";
import { getPreferredVariation } from "@/lib/getPreferredVariation";
import { useStore } from "@/store/store";
import { useUnresolvedFreeGifts } from "@/hooks/useUnresolvedFreeGifts";
import { useFreeGiftProducts } from "@/hooks/useFreeGiftProducts";
import { getProductPath } from "@/lib/productUrl";
import { pdpRadius } from "@/components/product/pdpStyles";

type GiftCardItem = {
  id: number | string;
  name: string;
  href?: string;
  imageUrl?: string;
};

function GiftCard({ gift }: { gift: GiftCardItem }) {
  const inner = (
    <div className={`flex items-center gap-3 border border-emerald-100 bg-white p-2.5 ${pdpRadius}`}>
      <div className={`relative h-14 w-14 flex-shrink-0 overflow-hidden bg-slate-100 ${pdpRadius}`}>
        {gift.imageUrl ? (
          <Image
            src={gift.imageUrl}
            alt={gift.name}
            fill
            className="object-contain"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-800">
          {gift.name}
        </div>
        <div className="text-xs font-medium text-emerald-700">
          Included for free
        </div>
      </div>
    </div>
  );

  return gift.href ? (
    <Link href={gift.href} className="block">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

export default function FreeGiftPreview({
  product,
}: {
  product: SimpleProduct & VariableProduct;
}) {
  // Track the actively selected variation through the same store ProductDetails
  // writes to, so this preview hides/updates as the user toggles variations.
  // Pre-selection (initial load) falls back to the preferred (in-stock, lowest
  // price) variation - same default ProductDetails uses.
  const activeVariationId = useStore((s) => s.product.activeVariationId);
  const variationNodes = useMemo(
    () =>
      ((product as VariableProduct).variations?.nodes as ProductVariation[]) ??
      [],
    [product],
  );
  const activeVariation = useMemo((): ProductVariation | undefined => {
    if (!variationNodes.length) return undefined;
    if (activeVariationId != null) {
      const match = variationNodes.find(
        (v) => v.databaseId === activeVariationId,
      );
      if (match) return match;
    }
    return (
      getPreferredVariation(variationNodes) ??
      findBogoEnabledVariation(variationNodes)
    );
  }, [variationNodes, activeVariationId]);

  const bogo = useMemo(
    () => resolveBogoConfig(product, activeVariation),
    [product, activeVariation]
  );

  const activeVariationDbId = activeVariation?.databaseId;
  const bogoSourceId = useMemo(() => {
    if (
      activeVariationDbId &&
      bogo.freeProductIds.length === 1 &&
      bogo.freeProductIds[0] === activeVariationDbId
    ) {
      return activeVariationDbId;
    }
    return product?.databaseId;
  }, [activeVariationDbId, bogo.freeProductIds, product?.databaseId]);
  const crossProductFreeIds = useMemo(
    () => bogo.freeProductIds.filter((id) => id !== bogoSourceId),
    [bogo.freeProductIds, bogoSourceId]
  );
  const isSameProductFreeOffer =
    bogo.isBogoEnabled &&
    bogo.freeProductIds.length > 0 &&
    crossProductFreeIds.length === 0;

  const { nodes: freeGiftNodes, loading: freeGiftLoading } = useFreeGiftProducts(
    crossProductFreeIds,
    { enabled: bogo.isBogoEnabled }
  );

  const unresolvedFreeIds = useMemo(() => {
    const resolved = new Set(
      freeGiftNodes
        .map((p: { databaseId?: number }) => p?.databaseId)
        .filter((id: number | undefined): id is number => Number.isFinite(id))
    );
    return crossProductFreeIds.filter((id) => !resolved.has(id));
  }, [crossProductFreeIds, freeGiftNodes]);

  const unresolvedIdsForHook = useMemo(
    () => (bogo.isBogoEnabled ? unresolvedFreeIds : []),
    [bogo.isBogoEnabled, unresolvedFreeIds]
  );
  const { resolved: unresolvedResolved, loading: unresolvedLoading } =
    useUnresolvedFreeGifts(unresolvedIdsForHook);

  const resolvedGiftCards = useMemo<GiftCardItem[]>(
    () =>
      freeGiftNodes.map((p: any) => {
        const href = p?.slug ? getProductPath(p) : undefined;
        const imageUrl =
          p?.image?.sourceUrl ||
          p?.featuredImage?.node?.sourceUrl ||
          undefined;
        return {
          id: p?.databaseId ?? p?.id ?? p?.name,
          name: p?.name || "Free gift",
          href,
          imageUrl,
        };
      }),
    [freeGiftNodes]
  );

  const unresolvedGiftCards = useMemo<GiftCardItem[]>(
    () =>
      unresolvedResolved.map((r) => ({
        id: r.databaseId ?? r.id,
        name: r.name,
        href: r.href,
        imageUrl: r.imageUrl,
      })),
    [unresolvedResolved]
  );

  const selfGiftCard = useMemo<GiftCardItem | null>(
    () =>
      isSameProductFreeOffer
        ? {
            id: product?.databaseId ?? product?.id ?? "self-free-product",
            name: product?.name || "Free gift",
            href: product?.slug ? getProductPath(product) : undefined,
            imageUrl:
              product?.image?.sourceUrl ||
              product?.featuredImage?.node?.sourceUrl ||
              undefined,
          }
        : null,
    [isSameProductFreeOffer, product]
  );

  const allGiftCards = useMemo<GiftCardItem[]>(
    () => [
      ...resolvedGiftCards,
      ...unresolvedGiftCards,
      ...(selfGiftCard ? [selfGiftCard] : []),
    ],
    [resolvedGiftCards, unresolvedGiftCards, selfGiftCard]
  );

  if (!bogo.isBogoEnabled) return null;
  if (freeGiftLoading || unresolvedLoading) {
    return (
      <div className={`mt-4 border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-emerald-700 ${pdpRadius}`}>
        Loading free gift...
      </div>
    );
  }
  if (allGiftCards.length === 0) return null;

  return (
    <div className={`mt-4 border border-emerald-200 bg-emerald-50/40 p-3 ${pdpRadius}`}>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
        + Free
      </div>
      <div className="space-y-2">
        {allGiftCards.map((gift) => (
          <GiftCard key={gift.id} gift={gift} />
        ))}
      </div>
    </div>
  );
}
