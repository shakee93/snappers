"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Loader, ArrowRight, ShoppingCart } from "lucide-react";
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

interface ResolvedDisplayPricing {
  /** Lowest variation / parent formatted price — used by `resolveDisplayPrice`. */
  price: string | null;
  /** When min !== max, listing cards show a sale price range. */
  priceMin: number | null;
  priceMax: number | null;
  regularMin: number | null;
  regularMax: number | null;
}

const resolveParentLevelPricing = (
  priceStr: string | null | undefined,
  regularStr: string | null | undefined,
): ResolvedDisplayPricing => {
  const sale = parsePriceString(priceStr ?? regularStr);
  const regular = parsePriceString(regularStr);
  const onSale = regular > sale && sale > 0;

  return {
    price: priceStr ?? regularStr ?? null,
    priceMin: sale > 0 ? sale : null,
    priceMax: sale > 0 ? sale : null,
    regularMin: onSale ? regular : null,
    regularMax: onSale ? regular : null,
  };
};

export const resolveDisplayPricing = (
  product: ProductCardItem,
): ResolvedDisplayPricing => {
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
      const saleAmounts = priced.map((v) => parsePriceString(v.price));

      const lowest = priced.reduce((prev, curr) =>
        parsePriceString(curr.price) < parsePriceString(prev.price) ? curr : prev,
      );

      const priceMin = Math.min(...saleAmounts);
      const priceMax = Math.max(...saleAmounts);

      const onSale = priced.filter((v) => {
        const sale = parsePriceString(v.price);
        const regular = parsePriceString(v.regularPrice);
        return regular > sale;
      });
      const allVariationsOnSale =
        onSale.length > 0 && onSale.length === priced.length;

      let regularMin: number | null = null;
      let regularMax: number | null = null;

      if (allVariationsOnSale) {
        const regularAmounts = onSale
          .map((v) => parsePriceString(v.regularPrice))
          .filter((p) => p > 0);
        regularMin = regularAmounts.length ? Math.min(...regularAmounts) : null;
        regularMax = regularAmounts.length ? Math.max(...regularAmounts) : null;
      } else {
        const lowestRegular = parsePriceString(lowest.regularPrice);
        const lowestSale = parsePriceString(lowest.price);
        if (lowestRegular > lowestSale) {
          regularMin = lowestRegular;
          regularMax = lowestRegular;
        }
      }

      return {
        price: lowest.price ?? null,
        priceMin,
        priceMax,
        regularMin,
        regularMax,
      };
    }

    return resolveParentLevelPricing(price, regularPrice);
  }

  return resolveParentLevelPricing(price, regularPrice);
};

export const resolveDisplayPrice = (product: ProductCardItem): string | null =>
  resolveDisplayPricing(product).price;

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

  const sale = useMemo(() => resolveProductSale(product), [product]);

  // Explicit label wins (Deals/Health); otherwise show the on-sale discount.
  const badge = useMemo(() => {
    if (badgeLabel) return badgeLabel;
    return sale ? `${sale.roundedPercent}% OFF!` : null;
  }, [badgeLabel, sale]);

  const saleBadge = useMemo(() => {
    if (!badgeLabel || !sale) return null;
    return `${sale.roundedPercent}% OFF!`;
  }, [badgeLabel, sale]);

  const isPreOrder = useMemo(
    () =>
      product.productTags?.nodes?.some(
        (tag) => (tag as { slug?: string | null }).slug === "pre-order",
      ) ?? false,
    [product.productTags?.nodes],
  );

  const displayPricing = useMemo(() => resolveDisplayPricing(product), [product]);
  const displayPrice = displayPricing.price;

  const numericPrice = useMemo(
    () =>
      displayPricing.priceMin != null && displayPricing.priceMin > 0
        ? displayPricing.priceMin
        : parsePriceString(displayPrice),
    [displayPrice, displayPricing.priceMin],
  );

  const showPriceRange = useMemo(() => {
    const { priceMin, priceMax } = displayPricing;
    return (
      priceMin != null &&
      priceMax != null &&
      priceMin > 0 &&
      priceMax > priceMin
    );
  }, [displayPricing]);

  const showRegularRange = useMemo(() => {
    const { regularMin, regularMax } = displayPricing;
    return regularMin != null && regularMax != null && regularMax > regularMin;
  }, [displayPricing]);

  const showRegularStrike = useMemo(() => {
    const { regularMin, priceMin } = displayPricing;
    return regularMin != null && priceMin != null && regularMin > priceMin;
  }, [displayPricing]);

  const kokoInstallment = useMemo(() => {
    if (!numericPrice) return 0;
    return numericPrice / 3;
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
    : isPreOrder
      ? "Pre-order Now"
      : "Buy Now";

  const ButtonIcon = isVariableInStock ? ArrowRight : ShoppingCart;

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white ${className}`}
    >
      <div className="relative w-full shrink-0">
        <Link
          href={link || "#"}
          className="relative block w-full bg-[#FAFAFA] pt-[100%]"
        >
          {isOutOfStock ? (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-neutral-700 px-2.5 py-1 text-[11px] font-bold leading-none text-white sm:px-3 sm:text-xs">
              Out of Stock
            </span>
          ) : (
            badge && (
              <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
                <span
                  style={{ backgroundColor: accentColor }}
                  className="rounded-md px-2.5 py-1 text-[11px] font-bold leading-none text-center text-black sm:px-3 sm:text-sm"
                >
                  {badge}
                </span>
                {saleBadge && (
                  <span
                    className="self-stretch rounded-md bg-[#F5B289] px-2.5 py-1 text-center text-xs font-bold leading-none text-neutral-900 sm:px-3 sm:text-sm"
                  >
                    {saleBadge}
                  </span>
                )}
              </div>
            )
          )}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name ?? "Product"}
              fill
              sizes="(max-width: 640px) 45vw, 20vw"
              className={`object-cover ${
                isOutOfStock ? "opacity-50" : ""
              }`}
            />
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-neutral-100 ${
                isOutOfStock ? "opacity-50" : ""
              }`}
              aria-label={name ? `${name} — no image available` : "No product image available"}
            >
              <ImageIcon
                className="h-16 w-16 text-neutral-400 sm:h-20 sm:w-20"
                strokeWidth={1.25}
                aria-hidden
              />
            </div>
          )}
        </Link>

        <WishlistButton
          productId={productDbId}
          size={18}
          className="absolute bottom-2.5 right-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-[#fafaf8] shadow-sm hover:bg-neutral-50 sm:bottom-3 sm:right-3"
        />
      </div>

      <div className="flex flex-1 flex-col border-t border-neutral-200 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <Link href={link || "#"} className="flex-1">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-left text-[13px] font-bold leading-snug text-neutral-900 sm:text-sm">
            {name}
          </h3>
        </Link>

        {numericPrice > 0 && (
          <div className="mt-2 flex flex-wrap items-end gap-2 text-left">
            <p className="text-sm font-bold leading-snug text-neutral-900 sm:text-base">
              {showPriceRange &&
              displayPricing.priceMin != null &&
              displayPricing.priceMax != null ? (
                <>
                  LKR {formatLkr(displayPricing.priceMin)} – LKR{" "}
                  {formatLkr(displayPricing.priceMax)}
                </>
              ) : (
                <>LKR {formatLkr(numericPrice)}</>
              )}
            </p>
            {showRegularStrike && displayPricing.regularMin != null && (
              <p className="text-xs font-medium leading-snug text-neutral-400 line-through sm:text-sm">
                {showRegularRange &&
                displayPricing.regularMax != null ? (
                  <>
                    LKR {formatLkr(displayPricing.regularMin)} – LKR{" "}
                    {formatLkr(displayPricing.regularMax)}
                  </>
                ) : (
                  <>LKR {formatLkr(displayPricing.regularMin)}</>
                )}
              </p>
            )}
          </div>
        )}

        {numericPrice > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-left text-[11px] text-neutral-500 sm:text-xs">
            <span>or LKR {formatLkr(kokoInstallment)} with</span>
            <Image src={koko} alt="KOKO" className="inline-block h-auto w-9 sm:w-10" />
          </div>
        )}

        <div className="mt-3 sm:mt-4">
          <button
            type="button"
            style={{ backgroundColor: accentColor }}
            disabled={loading || isOutOfStock}
            onClick={handleAddToCart}
            className="flex w-full min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : !isOutOfStock ? (
              <ButtonIcon className="h-4 w-4" strokeWidth={2.25} />
            ) : null}
            <span>{loading ? "Adding…" : buttonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
