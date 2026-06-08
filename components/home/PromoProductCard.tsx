"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import koko from "@/public/koko.png";
import { useCart } from "@/context/CartProvider";
import useProductLink from "@/hooks/useProductLink";
import { getDatabaseIdFromProductLike } from "@/lib/bogo";
import { parsePriceString } from "@/lib/productSale";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";

export type PromoProduct = SimpleProduct | VariableProduct;

export interface PromoProductCardProps {
  product: PromoProduct;
  badgeLabel: string;
  accentColor: string;
}

const formatLkr = (value: number) =>
  value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const resolveLowestInStockPrice = (product: PromoProduct): string | null => {
  const { type, price, variations } = product;

  if (type === "VARIABLE" && variations?.nodes?.length) {
    const inStock = variations.nodes.filter(
      (variation): variation is ProductVariation =>
        !!variation && variation.stockStatus === "IN_STOCK"
    );

    if (!inStock.length) return price ?? null;

    const lowest = inStock.reduce((prev, curr) =>
      parsePriceString(curr.price) < parsePriceString(prev.price) ? curr : prev
    );

    return lowest.price ?? price ?? null;
  }

  return price ?? null;
};

const PromoProductCard = ({
  product,
  badgeLabel,
  accentColor,
}: PromoProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const link = useProductLink(product);
  const router = useRouter();

  const { name, image, stockStatus, type, rawPrice } = product;
  const productDbId = getDatabaseIdFromProductLike(product) ?? product.databaseId;

  const isPreOrder = useMemo(
    () =>
      product.productTags?.nodes?.some((tag) => tag.slug === "pre-order") ??
      false,
    [product.productTags?.nodes]
  );

  const displayPrice = useMemo(
    () => resolveLowestInStockPrice(product),
    [product]
  );

  const numericPrice = useMemo(
    () => parsePriceString(displayPrice),
    [displayPrice]
  );

  const kokoInstallment = useMemo(() => {
    if (!numericPrice) return 0;
    return ((numericPrice / 88) * 100) / 3;
  }, [numericPrice]);

  const imageUrl = image?.sourceUrl?.replace("http://", "https://") ?? "";
  const isSimplePurchasable =
    type === "SIMPLE" &&
    stockStatus === "IN_STOCK" &&
    rawPrice !== "0.00" &&
    !!productDbId;
  const isVariableInStock = type === "VARIABLE" && stockStatus === "IN_STOCK";
  const canAddToCart = isSimplePurchasable;
  const isOutOfStock = stockStatus !== "IN_STOCK";

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    if (isVariableInStock) {
      if (link) router.push(link);
      return;
    }

    if (!canAddToCart || !productDbId) return;

    setLoading(true);
    try {
      await addToCart(productDbId, 1, undefined, product);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to add item to cart.";
      if (message.includes("You cannot add that amount")) {
        toast.error(
          "You've reached the maximum quantity allowed for this item."
        );
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = isOutOfStock
    ? "Out of Stock"
    : isVariableInStock
      ? "Choose Options"
      : isPreOrder
        ? "Pre-order Now"
        : "Add to Basket";

  return (
    <div className="relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <Link
        href={link || "#"}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl"
      >
        <span
          style={{ backgroundColor: accentColor }}
          className="absolute left-2 top-2 z-10 rounded-md px-2.5 py-1 text-xs font-bold text-white"
        >
          {badgeLabel}
        </span>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name ?? "Product"}
            width={300}
            height={300}
            sizes="(max-width: 640px) 50vw, 25vw"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-neutral-100" aria-hidden />
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link href={link || "#"}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-neutral-900">
            {name}
          </h3>
        </Link>

        {numericPrice > 0 && (
          <p className="mt-2 text-lg font-bold text-neutral-900">
            LKR {formatLkr(numericPrice)}
          </p>
        )}

        {numericPrice > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <span>or LKR {formatLkr(kokoInstallment)} with</span>
            <Image src={koko} alt="KOKO" className="inline-block h-auto w-10" />
          </div>
        )}

        <button
          type="button"
          style={{ backgroundColor: accentColor }}
          disabled={loading || isOutOfStock}
          onClick={handleAddToCart}
          className="mt-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{loading ? "Adding…" : buttonLabel}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/15">
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PromoProductCard;
