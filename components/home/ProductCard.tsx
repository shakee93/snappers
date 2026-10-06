"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ImageIcon,
  Loader,
  Minus,
  Plus,
  Star,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartProvider";
import useProductLink from "@/hooks/useProductLink";
import WishlistButton from "@/components/product/WishlistButton";
import { getDatabaseIdFromProductLike } from "@/lib/bogo";
import { resolveProductImageUrl } from "@/lib/productImage";
import { parsePriceString, resolveProductSale } from "@/lib/productSale";
import type { ListingImagePatch } from "@/lib/listingImagePatch";
import { getCartLineStockCap } from "@/lib/cartLineStockCap";
import {
  CartItem,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";

type ProductCardBase = SimpleProduct | VariableProduct;

export type ProductCardItem = ProductCardBase & {
  variations?: VariableProduct["variations"];
  rawPrice?: string | null;
  averageRating?: number | null;
  brands?: {
    nodes?: ({ name?: string | null; slug?: string | null } | null)[] | null;
  } | null;
  productCategories?: {
    nodes?: ({ name?: string | null; parentDatabaseId?: number | null } | null)[];
  } | null;
};

export interface ProductCardProps {
  product: ProductCardItem;
  /** Corner badge on the right (e.g. "Deals", "Health"). Omit to auto-show "New" when tagged. */
  badgeLabel?: string;
  accentColor?: string;
  className?: string;
  /** GraphQL image backfill when Typesense search hits omit variation media. */
  listingImageByProductId?: Record<number, ListingImagePatch>;
}

/** Grocery-style card accent — badges, price, brand, Add button. */
const CARD_ACCENT = "#3BB77E";
const CARD_ACCENT_MUTED = "#DEF9EC";
/** In-cart quantity stepper (after Add). */
const CART_ACTIVE_ACCENT = "#F97316";
const CART_ACTIVE_MUTED = "#FFEDD5";
const TITLE_COLOR = "#253D4E";

/** Shared shell so Add ↔ quantity stepper does not shift card layout. */
const CART_ACTION_SHELL_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold leading-none sm:px-3.5 sm:py-2.5 sm:text-[13px]";

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

const NEW_PRODUCT_TAG_SLUGS = new Set([
  "new",
  "new-arrival",
  "new-arrivals",
  "new-arrival",
]);

const ProductCard = ({
  product,
  badgeLabel,
  className = "",
  listingImageByProductId,
}: ProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { cart, addToCart, updateCart, removeFromCart } = useCart();
  const link = useProductLink(product);
  const router = useRouter();

  const { name, image, stockStatus, type, rawPrice, purchasable } = product;
  const productDbId = getDatabaseIdFromProductLike(product) ?? product.databaseId;

  const sale = useMemo(() => resolveProductSale(product), [product]);

  const salePercentBadge = useMemo(() => {
    if (!sale) return null;
    return `${sale.roundedPercent}%`;
  }, [sale]);

  const isNewProduct = useMemo(
    () =>
      product.productTags?.nodes?.some((tag) => {
        const slug = (tag as { slug?: string | null }).slug;
        return slug != null && NEW_PRODUCT_TAG_SLUGS.has(slug);
      }) ?? false,
    [product.productTags?.nodes],
  );

  const rightCornerBadge = useMemo(() => {
    if (badgeLabel) return badgeLabel;
    if (isNewProduct) return "New";
    return null;
  }, [badgeLabel, isNewProduct]);

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

  const categoryLabel = useMemo(() => {
    type CategoryNode = {
      name?: string | null;
      parentDatabaseId?: number | null;
    };
    const nodes = (product.productCategories?.nodes ?? []) as CategoryNode[];
    const leaf =
      nodes.find((c) => c.name && (c.parentDatabaseId ?? 0) > 0) ??
      nodes.find((c) => c.name);
    return leaf?.name ?? null;
  }, [product.productCategories?.nodes]);

  const brandName = product.brands?.nodes?.[0]?.name ?? null;
  const reviewCount = product.reviewCount ?? 0;
  const averageRating = Math.min(
    5,
    Math.max(0, product.averageRating ?? 0),
  );

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
  const isOutOfStock = stockStatus !== "IN_STOCK" || purchasable === false;

  const cartLine = useMemo((): CartItem | null => {
    if (!canAddToCart || productDbId == null) return null;
    const nodes = cart?.contents?.nodes ?? [];
    return (
      nodes.find((item) => {
        if (!item?.key) return false;
        const node = item.product?.node;
        if (node?.databaseId !== productDbId) return false;
        return !item.variation?.node;
      }) ?? null
    );
  }, [canAddToCart, cart?.contents?.nodes, productDbId]);

  const cartQuantity = cartLine?.quantity ?? 0;
  const showQuantityStepper = canAddToCart && cartQuantity > 0;

  const stockCap = useMemo(
    () => (cartLine ? getCartLineStockCap(cartLine) : null),
    [cartLine],
  );

  const cartMutationOptions = { openCart: false } as const;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    if (isVariableInStock) {
      if (link) router.push(link);
      return;
    }

    if (!canAddToCart || !productDbId) return;

    setLoading(true);
    try {
      await addToCart(
        productDbId,
        1,
        undefined,
        product,
        cartMutationOptions,
      );
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

  const handleDecrementQuantity = async () => {
    if (!cartLine?.key || loading) return;

    setLoading(true);
    try {
      if (cartQuantity <= 1) {
        await removeFromCart([cartLine.key]);
      } else {
        await updateCart(cartLine.key, cartQuantity - 1);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to update cart.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementQuantity = async () => {
    if (loading || isOutOfStock) return;

    if (stockCap?.atMax(cartQuantity)) {
      toast.error(
        "You've reached the maximum quantity allowed for this item.",
      );
      return;
    }

    setLoading(true);
    try {
      if (cartLine?.key) {
        await updateCart(cartLine.key, cartQuantity + 1);
      } else if (canAddToCart && productDbId) {
        await addToCart(
          productDbId,
          1,
          undefined,
          product,
          cartMutationOptions,
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to update cart.";
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

  const addButtonLabel = isOutOfStock
    ? "Out of Stock"
    : isPreOrder
      ? "Pre-order"
      : "Add";

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white ${className}`}
    >
      <div className="relative w-full shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
        <Link
          href={link || "#"}
          className="relative block w-full overflow-hidden rounded-xl bg-[#FAFAFA] pt-[85%]"
        >
          {isOutOfStock ? (
            <span
              className="absolute left-0 top-0 z-10 rounded-br-2xl px-3 py-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: CARD_ACCENT }}
            >
              Out of Stock
            </span>
          ) : (
            <>
              {salePercentBadge && (
                <span
                  className="absolute left-0 top-0 z-10 rounded-br-2xl px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: CARD_ACCENT }}
                >
                  {salePercentBadge}
                </span>
              )}
              {rightCornerBadge && (
                <span
                  className="absolute right-0 top-0 z-10 rounded-bl-2xl px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: CARD_ACCENT }}
                >
                  {rightCornerBadge}
                </span>
              )}
            </>
          )}

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name ?? "Product"}
              fill
              sizes="(max-width: 640px) 45vw, 20vw"
              className={`object-contain p-3 ${isOutOfStock ? "opacity-50" : ""}`}
            />
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-neutral-100 ${
                isOutOfStock ? "opacity-50" : ""
              }`}
              aria-label={
                name ? `${name} — no image available` : "No product image available"
              }
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
          className="absolute bottom-1 right-1 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white/90 shadow-sm hover:bg-white sm:bottom-2 sm:right-2"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        {categoryLabel && (
          <p className="text-left text-[11px] text-neutral-400 sm:text-xs">
            {categoryLabel}
          </p>
        )}

        <Link href={link || "#"} className="mt-0.5 flex-1">
          <h3
            className="line-clamp-2 min-h-[2.35rem] text-left text-[13px] font-bold leading-snug sm:text-sm"
            style={{ color: TITLE_COLOR }}
          >
            {name}
          </h3>
        </Link>

        {(reviewCount > 0 || averageRating > 0) && (
          <div
            className="mt-1.5 flex items-center gap-1.5"
            aria-label={`${averageRating} out of 5 stars, ${reviewCount} reviews`}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => {
                const filled = averageRating >= index + 1;
                const partial = !filled && averageRating > index;
                return (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                      filled || partial
                        ? "fill-[#FDC040] text-[#FDC040]"
                        : "fill-transparent text-neutral-300"
                    }`}
                    strokeWidth={1.5}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-neutral-400 sm:text-xs">
              {reviewCount}
            </span>
          </div>
        )}

        {brandName && (
          <p className="mt-1 text-left text-[11px] sm:text-xs">
            <span className="text-neutral-400">By </span>
            <span className="font-medium" style={{ color: CARD_ACCENT }}>
              {brandName}
            </span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {numericPrice > 0 ? (
            <div className="min-w-0 flex-1 text-left">
              <p
                className="text-sm font-bold leading-tight sm:text-base"
                style={{ color: CARD_ACCENT }}
              >
                {showPriceRange &&
                displayPricing.priceMin != null &&
                displayPricing.priceMax != null ? (
                  <>
                    LKR {formatLkr(displayPricing.priceMin)} –{" "}
                    {formatLkr(displayPricing.priceMax)}
                  </>
                ) : (
                  <>LKR {formatLkr(numericPrice)}</>
                )}
              </p>
              {showRegularStrike && displayPricing.regularMin != null && (
                <p className="text-[11px] font-medium text-neutral-400 line-through sm:text-xs">
                  {showRegularRange && displayPricing.regularMax != null ? (
                    <>
                      LKR {formatLkr(displayPricing.regularMin)} –{" "}
                      {formatLkr(displayPricing.regularMax)}
                    </>
                  ) : (
                    <>LKR {formatLkr(displayPricing.regularMin)}</>
                  )}
                </p>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {showQuantityStepper ? (
            <div
              className={CART_ACTION_SHELL_CLASS}
              style={{
                backgroundColor: CART_ACTIVE_MUTED,
                color: CART_ACTIVE_ACCENT,
              }}
            >
              <button
                type="button"
                disabled={loading}
                onClick={handleDecrementQuantity}
                aria-label={
                  cartQuantity <= 1 ? "Remove from cart" : "Decrease quantity"
                }
                className="flex items-center justify-center p-0 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : cartQuantity <= 1 ? (
                  <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                ) : (
                  <Minus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                )}
              </button>
              <span
                className="min-w-[1.25rem] text-center tabular-nums"
                aria-live="polite"
              >
                {cartQuantity}
              </span>
              <button
                type="button"
                disabled={
                  loading ||
                  (stockCap != null && stockCap.atMax(cartQuantity))
                }
                onClick={handleIncrementQuantity}
                aria-label="Increase quantity"
                className="flex items-center justify-center p-0 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading || isOutOfStock}
              onClick={handleAddToCart}
              className={`${CART_ACTION_SHELL_CLASS} transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
              style={{
                backgroundColor: CARD_ACCENT_MUTED,
                color: CARD_ACCENT,
              }}
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" strokeWidth={2.25} />
              )}
              <span>{loading ? "Adding…" : addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
