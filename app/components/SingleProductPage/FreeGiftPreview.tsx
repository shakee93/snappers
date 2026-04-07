"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import {
  GET_PRODUCT_BY_DATABASE_ID,
  GET_PRODUCTS_BY_DATABASE_IDS,
  GET_PRODUCT_VARIATION_BY_DATABASE_ID,
} from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { mergeProductMetaForBogo, normalizeBogoConfig } from "@/lib/bogo";

type GiftCardItem = {
  id: number | string;
  name: string;
  href?: string;
  imageUrl?: string;
};

export default function FreeGiftPreview({
  product,
}: {
  product: SimpleProduct & VariableProduct;
}) {
  const bogo = normalizeBogoConfig(
    mergeProductMetaForBogo(product as Parameters<typeof mergeProductMetaForBogo>[0]),
    product?.databaseId
  );

  const crossProductFreeIds = bogo.freeProductIds.filter(
    (id) => id !== product?.databaseId
  );
  const isSameProductFreeOffer =
    bogo.isBogoEnabled &&
    bogo.freeProductIds.length > 0 &&
    crossProductFreeIds.length === 0;

  const { data: freeGiftData, loading: freeGiftLoading } = useQuery(
    GET_PRODUCTS_BY_DATABASE_IDS,
    {
      variables: { ids: crossProductFreeIds },
      skip: !bogo.isBogoEnabled || crossProductFreeIds.length === 0,
      fetchPolicy: "network-only",
    }
  );

  const freeGiftNodes =
    freeGiftData?.products?.nodes?.filter(
      (p: { name?: string | null } | null): p is NonNullable<typeof p> =>
        !!p?.name
    ) ?? [];

  const resolvedProductIds = new Set(
    freeGiftNodes
      .map((p: { databaseId?: number }) => p?.databaseId)
      .filter((id: number | undefined): id is number => Number.isFinite(id))
  );

  const unresolvedFreeIds = crossProductFreeIds.filter(
    (id) => !resolvedProductIds.has(id)
  );
  const firstUnresolvedFreeId = unresolvedFreeIds[0];

  const {
    data: freeGiftSingleProductData,
    loading: freeGiftSingleProductLoading,
  } = useQuery(GET_PRODUCT_BY_DATABASE_ID, {
    variables: { id: String(firstUnresolvedFreeId) },
    skip: !bogo.isBogoEnabled || !firstUnresolvedFreeId,
    fetchPolicy: "network-only",
  });

  const {
    data: freeGiftVariationData,
    loading: freeGiftVariationLoading,
  } = useQuery(GET_PRODUCT_VARIATION_BY_DATABASE_ID, {
    variables: { id: String(firstUnresolvedFreeId) },
    skip:
      !bogo.isBogoEnabled ||
      !firstUnresolvedFreeId ||
      freeGiftNodes.length === crossProductFreeIds.length,
    fetchPolicy: "network-only",
  });

  const fallbackSingleProduct = freeGiftSingleProductData?.product;
  const fallbackVariationParent = freeGiftVariationData?.productVariation?.parent?.node;

  const giftCards: GiftCardItem[] = freeGiftNodes.map((p: any) => {
    const brandSlug = p?.brands?.nodes?.[0]?.slug;
    const href = brandSlug && p?.slug ? `/${brandSlug}/${p.slug}` : undefined;
    const imageUrl =
      p?.image?.sourceUrl || p?.featuredImage?.node?.sourceUrl || undefined;
    return {
      id: p?.databaseId ?? p?.id ?? p?.name,
      name: p?.name || "Free gift",
      href,
      imageUrl,
    };
  });

  if (giftCards.length === 0 && fallbackSingleProduct?.name) {
    const brandSlug = fallbackSingleProduct?.brands?.nodes?.[0]?.slug;
    const href =
      brandSlug && fallbackSingleProduct?.slug
        ? `/${brandSlug}/${fallbackSingleProduct.slug}`
        : undefined;
    giftCards.push({
      id: fallbackSingleProduct?.databaseId ?? fallbackSingleProduct?.name,
      name: fallbackSingleProduct?.name,
      href,
      imageUrl:
        fallbackSingleProduct?.image?.sourceUrl ||
        fallbackSingleProduct?.featuredImage?.node?.sourceUrl ||
        undefined,
    });
  }

  if (giftCards.length === 0 && fallbackVariationParent?.name) {
    const brandSlug = fallbackVariationParent?.brands?.nodes?.[0]?.slug;
    const href =
      brandSlug && fallbackVariationParent?.slug
        ? `/${brandSlug}/${fallbackVariationParent.slug}`
        : undefined;
    giftCards.push({
      id: fallbackVariationParent?.databaseId ?? fallbackVariationParent?.name,
      name: fallbackVariationParent?.name,
      href,
      imageUrl:
        fallbackVariationParent?.image?.sourceUrl ||
        fallbackVariationParent?.featuredImage?.node?.sourceUrl ||
        undefined,
    });
  }

  if (!bogo.isBogoEnabled) return null;
  if (
    freeGiftLoading ||
    freeGiftSingleProductLoading ||
    freeGiftVariationLoading
  ) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-emerald-700">
        Loading free gift...
      </div>
    );
  }
  if (giftCards.length === 0 && isSameProductFreeOffer) {
    const brandSlug = product?.brands?.nodes?.[0]?.slug;
    const href =
      brandSlug && product?.slug ? `/${brandSlug}/${product.slug}` : undefined;
    giftCards.push({
      id: product?.databaseId ?? product?.id ?? "self-free-product",
      name: product?.name || "Free gift",
      href,
      imageUrl:
        product?.image?.sourceUrl ||
        product?.featuredImage?.node?.sourceUrl ||
        undefined,
    });
  }

  if (giftCards.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
        + Free
      </div>
      <div className="space-y-2">
        {giftCards.map((gift) => {
          const cardInner = (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-2.5">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
            <Link key={gift.id} href={gift.href} className="block">
              {cardInner}
            </Link>
          ) : (
            <div key={gift.id}>{cardInner}</div>
          );
        })}
      </div>
    </div>
  );
}
