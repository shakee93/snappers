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
import WishlistButton from "@/components/product/WishlistButton";
import { getDatabaseIdFromProductLike } from "@/lib/bogo";
import { resolveProductImageUrl } from "@/lib/productImage";
import { parsePriceString, resolveProductSale } from "@/lib/productSale";
import type { ListingImagePatch } from "@/lib/listingImagePatch";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";

type ProductCardBase = SimpleProduct | VariableProduct;

export type ProductCardItem = ProductCardBase & {
  variations?: VariableProduct["variations"];
  rawPrice?: string | null;
};

export interface ProductCardProps {
  product: ProductCardItem;
  /** Explicit badge (e.g. "Deals", "Health"). Omit to auto-show "X% OFF!" on sale. */
  badgeLabel?: string;
  accentColor?: string;
  className?: string;
  /** GraphQL image backfill when Typesense search hits omit variation media. */
  listingImageByProductId?: Record<number, ListingImagePatch>;
}

const DEFAULT_ACCENT = "#B8D962";

const formatLkr = (value: number) =>
  value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const resolveDisplayPrice = (product: ProductCardItem): string | null => {
  const { type, price, regularPrice, variations } = product;

  if (type === "VARIABLE" && variations?.nodes?.length) {
    const nodes = variations.nodes.filter(
      (variation): variation is ProductVariation => !!variation,
    );
    // Prefer in-stock variations, but still show a price when sold out.
    const inStock = nodes.filter((v) => v.stockStatus === "IN_STOCK");
    const pool = inStock.length ? inStock : nodes;
    const priced = pool.filter((v) => parsePriceString(v.price) > 0);

    if (priced.length) {
      const lowest = priced.reduce((prev, curr) =>
        parsePriceString(curr.price) < parsePriceString(prev.price) ? curr : prev,
      );
      return lowest.price ?? null;
    }

    return price ?? regularPrice ?? null;
  }

  return price ?? regularPrice ?? null;
};

const ProductCard = ({
  product,
  badgeLabel,
  accentColor = DEFAULT_ACCENT,
  className = "",
  listingImageByProductId,
}: ProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const link = useProductLink(product);
  const router = useRouter();

  const { name, image, stockStatus, type, rawPrice, purchasable } = product;
  const productDbId = getDatabaseIdFromProductLike(product) ?? product.databaseId;

  // Explicit label wins (Deals/Health); otherwise show the on-sale discount.
  const badge = useMemo(() => {
    if (badgeLabel) return badgeLabel;
    const sale = resolveProductSale(product);
    return sale ? `${sale.roundedPercent}% OFF!` : null;
  }, [badgeLabel, product]);

  const isPreOrder = useMemo(
    () =>
      product.productTags?.nodes?.some(
        (tag) => (tag as { slug?: string | null }).slug === "pre-order",
      ) ?? false,
    [product.productTags?.nodes],
  );

  const displayPrice = useMemo(() => resolveDisplayPrice(product), [product]);

  const numericPrice = useMemo(
    () => parsePriceString(displayPrice),
    [displayPrice],
  );

  const kokoInstallment = useMemo(() => {
    if (!numericPrice) return 0;
    return ((numericPrice / 88) * 100) / 3;
  }, [numericPrice]);

  // Search hits often omit variation media; patch from the GraphQL backfill.
  const listingImagePatch =
    productDbId != null ? listingImageByProductId?.[productDbId] : undefined;
  const resolvedImage = listingImagePatch?.image ?? image;
  const resolvedVariations = listingImagePatch?.variations ?? product.variations;

  const imageUrl = useMemo(
    () => resolveProductImageUrl(resolvedImage, resolvedVariations) ?? "",
    [resolvedImage, resolvedVariations],
  );

  const isSimplePurchasable =
    type === "SIMPLE" &&
    stockStatus === "IN_STOCK" &&
    rawPrice !== "0.00" &&
    !!productDbId;
  const isVariableInStock = type === "VARIABLE" && stockStatus === "IN_STOCK";
  const canAddToCart = isSimplePurchasable;
  // WooCommerce flags products with no price as `purchasable: false` even while
  // their stockStatus stays IN_STOCK (e.g. discontinued items left in stock
  // with the price cleared). With no price they can't be added to cart, so the
  // card would otherwise render a broken "Add to Basket" with no price and no
  // badge. Treat them as out of stock so the badge and disabled state show.
  const isOutOfStock = stockStatus !== "IN_STOCK" || purchasable === false;

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
          "You've reached the maximum quantity allowed for this item.",
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
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white ${className}`}
    >
      <Link
        href={link || "#"}
        className="relative block aspect-square bg-[#FAFAFA]"
      >
        {isOutOfStock ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-neutral-700 px-2.5 py-1 text-[11px] font-bold leading-none text-white sm:px-3 sm:text-xs">
            Out of Stock
          </span>
        ) : (
          badge && (
            <span
              style={{ backgroundColor: accentColor }}
              className="absolute left-2.5 top-2.5 z-10 rounded-md px-2.5 py-1 text-[11px] font-bold leading-none text-black sm:px-3 sm:text-xs"
            >
              {badge}
            </span>
          )
        )}

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name ?? "Product"}
            width={400}
            height={400}
            sizes="(max-width: 640px) 45vw, 20vw"
            className={`aspect-square w-full object-cover ${
              isOutOfStock ? "opacity-50" : ""
            }`}
          />
        ) : (
          <div className="aspect-square w-full bg-neutral-200/60" aria-hidden />
        )}
      </Link>

      <div className="flex flex-1 flex-col border-t border-neutral-200 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <Link href={link || "#"} className="flex-1">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-left text-[13px] font-bold leading-snug text-neutral-900 sm:text-sm">
            {name}
          </h3>
        </Link>

        {numericPrice > 0 && (
          <p className="mt-2 text-left text-lg font-bold leading-none text-neutral-900 sm:text-xl">
            LKR {formatLkr(numericPrice)}
          </p>
        )}

        {numericPrice > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-left text-[11px] text-neutral-500 sm:text-xs">
            <span>or LKR {formatLkr(kokoInstallment)} with</span>
            <Image src={koko} alt="KOKO" className="inline-block h-auto w-9 sm:w-10" />
          </div>
        )}

        <div className="mt-3 flex items-stretch gap-2 sm:mt-4">
          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            disabled={loading || isOutOfStock}
            onClick={handleAddToCart}
            className="flex min-w-0 flex-1 items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
          >
            <span>{loading ? "Adding…" : buttonLabel}</span>
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black">
              {loading ? (
                <Loader className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              )}
            </span>
          </button>
          <WishlistButton
            productId={productDbId}
            size={18}
            className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
