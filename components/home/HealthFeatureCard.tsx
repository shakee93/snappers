"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import koko from "@/public/koko.png";
import { useCart } from "@/context/CartProvider";
import useProductLink from "@/hooks/useProductLink";
import { getDatabaseIdFromProductLike } from "@/lib/bogo";
import { resolveProductImageUrl } from "@/lib/productImage";
import { parsePriceString } from "@/lib/productSale";
import type { ProductCardItem } from "@/components/home/ProductCard";

export interface HealthFeatureCardProps {
  product: ProductCardItem;
  /** Display price resolved by the parent (lowest in-stock variation, etc.). */
  price: string | null;
  /** Big left-hand artwork for the slide; falls back to the product image. */
  featureImage?: string;
  /** Centre slide in the carousel — gets the highlighted card background. */
  isActive?: boolean;
}

const formatLkr = (value: number) =>
  value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toPlainText = (html?: string | null): string =>
  (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/\s+/g, " ")
    .trim();

const HealthFeatureCard = ({
  product,
  price,
  featureImage,
  isActive = false,
}: HealthFeatureCardProps) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const link = useProductLink(product);
  const router = useRouter();

  const { name, image, stockStatus, type, purchasable } = product;
  const productDbId = getDatabaseIdFromProductLike(product) ?? product.databaseId;

  const productImageUrl = useMemo(
    () => resolveProductImageUrl(image, product.variations) ?? "",
    [image, product.variations],
  );

  const heroImageUrl = featureImage || productImageUrl;

  const description = useMemo(() => {
    const short = toPlainText(product.shortDescription);
    if (short) return short;
    return toPlainText(product.description);
  }, [product.shortDescription, product.description]);

  const numericPrice = useMemo(() => parsePriceString(price), [price]);

  const isVariableInStock = type === "VARIABLE" && stockStatus === "IN_STOCK";
  const isSimplePurchasable =
    type === "SIMPLE" && stockStatus === "IN_STOCK" && !!productDbId;
  const isOutOfStock = stockStatus !== "IN_STOCK" || purchasable === false;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    if (isVariableInStock) {
      if (link) router.push(link);
      return;
    }

    if (!isSimplePurchasable || !productDbId) return;

    setLoading(true);
    try {
      await addToCart(productDbId, 1, undefined, product);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to add item to cart.";
      if (message.includes("You cannot add that amount")) {
        toast.error("You've reached the maximum quantity allowed for this item.");
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
      ? "Choose options"
      : loading
        ? "Adding…"
        : "Add to basket";

  return (
    <article
      className={`aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[#E8E8E8] transition-colors duration-300 max-sm:aspect-auto ${
        isActive ? "bg-[#F6F6F6]" : "bg-white"
      }`}
    >
      <div className="flex h-full flex-col sm:flex-row">
        {/* Left feature image with inset padding and rounded corners */}
        <Link
          href={link || "#"}
          className="block w-full p-4 sm:flex sm:h-full sm:w-1/2 sm:shrink-0 sm:p-5 lg:p-6"
          aria-label={name ?? "Product"}
        >
          {heroImageUrl ? (
            <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-[#E8E8E8] max-sm:aspect-[4/3]">
              <Image
                src={heroImageUrl}
                alt={name ?? "Product"}
                fill
                sizes="(max-width: 640px) 90vw, 22vw"
                className="object-cover object-center"
              />
            </div>
          ) : (
            <div
              className="h-full w-full rounded-[20px] border border-[#E8E8E8] bg-neutral-100 max-sm:aspect-[4/3]"
              aria-hidden
            />
          )}
        </Link>

        {/* Right product details — grid gives the thumbnail row an explicit height */}
        <div className="flex flex-col px-5 pb-5 pt-1 sm:grid sm:h-full sm:w-1/2 sm:min-h-0 sm:grid-rows-[auto_auto_minmax(0,1fr)_auto] sm:px-7 sm:py-6 lg:px-8 lg:py-7">
          <Link href={link || "#"} className="block">
            <h3 className="font-albra text-[1.4rem] font-bold leading-[1.25] text-[#0A0A0A] max-sm:line-clamp-2 max-sm:text-[1.25rem] sm:text-[1.65rem] lg:text-[1.85rem]">
              {name}
            </h3>
          </Link>

          {description ? (
            <p className="mt-2 line-clamp-3 text-[13px] leading-[1.55] text-[#1A1A1A] max-sm:hidden sm:mt-3 sm:line-clamp-4 sm:text-sm sm:leading-[1.65]">
              {description}
            </p>
          ) : (
            <div aria-hidden />
          )}

          {productImageUrl ? (
            <div className="mt-3 flex min-h-0 items-start sm:mt-4">
              <div className="relative h-full min-h-[64px] w-auto max-w-full shrink-0 overflow-hidden rounded-xl border border-[#E8E8E8] [aspect-ratio:1/1] max-sm:size-[72px]">
                <Image
                  src={productImageUrl}
                  alt={name ? `${name} product` : "Product"}
                  fill
                  sizes="(max-width: 640px) 72px, 160px"
                  className="object-cover object-left"
                />
              </div>
            </div>
          ) : (
            <div aria-hidden />
          )}

          <div className="pt-3 max-sm:mt-3 sm:pt-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              {numericPrice > 0 && (
                <div className="flex max-sm:flex-col max-sm:gap-1.5 flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="text-base font-bold text-[#0A0A0A] sm:text-lg">
                    LKR {formatLkr(numericPrice)}
                  </span>
                  <span className="text-sm font-bold text-[#0A0A0A]">× 3 with</span>
                  <Image
                    src={koko}
                    alt="KOKO"
                    className="inline-block h-auto w-9 sm:w-10"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={loading || isOutOfStock}
                onClick={handleAddToCart}
                className="inline-flex max-sm:w-full shrink-0 items-center justify-center gap-2 self-end rounded-full bg-[#C5E066] px-6 py-3 text-sm font-bold text-[#0A0A0A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[160px]"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                <span>{buttonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HealthFeatureCard;
