"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
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

const packshotBoxClassName =
  "relative overflow-hidden rounded-xl border border-[#E8E8E8] bg-white";

const SM_MEDIA_QUERY = "(min-width: 640px)";

function useIsSmUp(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(SM_MEDIA_QUERY);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(SM_MEDIA_QUERY).matches,
    () => false,
  );
}

type HealthFeatureDetailsProps = {
  name?: string | null;
  description: string;
  link: string;
  packshotImageUrl: string;
  priceRow: ReactNode;
  addToCartButton: ReactNode;
  footerLayout?: "mobile" | "desktop";
};

const HealthFeatureDetails = ({
  name,
  description,
  link,
  packshotImageUrl,
  priceRow,
  addToCartButton,
  footerLayout = "mobile",
}: HealthFeatureDetailsProps) => {
  const isDesktop = footerLayout === "desktop";

  return (
  <>
    <Link href={link || "#"} className="block shrink-0">
      <h3 className="font-albra text-xl font-bold leading-tight text-[#0A0A0A] sm:text-[1.65rem] sm:leading-[1.25] lg:text-[1.85rem]">
        {name}
      </h3>
    </Link>

    {description ? (
      <p
        className={`shrink-0 text-sm leading-relaxed text-[#1A1A1A] sm:mt-3 sm:leading-[1.65] ${
          isDesktop ? "line-clamp-4" : "line-clamp-7"
        }`}
      >
        {description}
      </p>
    ) : (
      <div aria-hidden />
    )}

    <Link
      href={link || "#"}
      className={
        isDesktop
          ? "flex h-full w-full items-center justify-start overflow-hidden"
          : "flex h-full min-h-[140px] w-full flex-col justify-center"
      }
      aria-label={name ?? "Product"}
    >
      {packshotImageUrl ? (
        isDesktop ? (
          <div
            className={`${packshotBoxClassName} aspect-square h-full w-auto max-h-full shrink-0`}
          >
            <Image
              src={packshotImageUrl}
              alt={name ? `${name} product` : "Product"}
              width={800}
              height={800}
              sizes="22vw"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`${packshotBoxClassName} mx-auto aspect-square w-[56%] max-w-[170px] shrink-0`}
          >
            <Image
              src={packshotImageUrl}
              alt={name ? `${name} product` : "Product"}
              width={800}
              height={800}
              sizes="90vw"
              className="h-full w-full object-contain p-4"
            />
          </div>
        )
      ) : (
        <div
          className={`${packshotBoxClassName} ${
            isDesktop
              ? "aspect-square h-full w-auto max-h-full shrink-0"
              : "aspect-square w-full shrink-0"
          }`}
          aria-hidden
        />
      )}
    </Link>
    {footerLayout === "mobile" ? (
      <div className="flex shrink-0 flex-col gap-2">
        <div className="min-w-0 overflow-hidden">{priceRow ?? <span />}</div>
        <div className="flex justify-end">{addToCartButton}</div>
      </div>
    ) : (
      <div className="flex shrink-0 flex-col gap-4">
        {priceRow}
        <div className="flex justify-end">{addToCartButton}</div>
      </div>
    )}
  </>
  );
};

const HealthFeatureCard = ({
  product,
  price,
  featureImage,
  isActive = false,
}: HealthFeatureCardProps) => {
  const [loading, setLoading] = useState(false);
  const isSmUp = useIsSmUp();
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
  const packshotImageUrl = productImageUrl || featureImage || "";

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

  const priceRow =
    numericPrice > 0 ? (
      <div className="flex items-center gap-x-1 whitespace-nowrap sm:flex-wrap sm:gap-y-1 sm:whitespace-normal">
        <span className="text-[13px] font-bold text-[#0A0A0A] sm:text-lg">
          LKR {formatLkr(numericPrice)}
        </span>
        <span className="text-[13px] font-bold text-[#0A0A0A] sm:text-sm">
          × 3 with
        </span>
        <Image src={koko} alt="KOKO" className="inline-block h-auto w-8 sm:w-10" />
      </div>
    ) : null;

  const addToCartButton = (
    <button
      type="button"
      disabled={loading || isOutOfStock}
      onClick={handleAddToCart}
      className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#C5E066] px-3.5 py-2 text-[13px] font-bold leading-none text-[#0A0A0A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[160px] sm:rounded-full sm:px-6 sm:py-3 sm:text-sm sm:leading-normal"
    >
      {loading && <Loader className="h-4 w-4 animate-spin" />}
      <span>{buttonLabel}</span>
    </button>
  );

  const detailsProps = {
    name,
    description,
    link: link || "#",
    packshotImageUrl,
    priceRow,
    addToCartButton,
  };

  return (
    <article
      className={`w-full overflow-hidden rounded-2xl border border-[#E8E8E8] bg-[#F6F6F6] transition-colors duration-300 max-sm:min-h-[440px] sm:aspect-[4/3] ${
        isActive ? "sm:bg-[#F6F6F6]" : "sm:bg-white"
      }`}
    >
      {isSmUp ? (
        <div className="grid h-full grid-cols-2">
          <Link
            href={link || "#"}
            className="flex h-full min-h-0 p-5 lg:p-6"
            aria-label={name ?? "Product"}
          >
            {heroImageUrl ? (
              <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-[20px] border border-[#E8E8E8]">
                <Image
                  src={heroImageUrl}
                  alt={name ?? "Product"}
                  fill
                  sizes="22vw"
                  className="object-cover object-center"
                />
              </div>
            ) : (
              <div
                className="h-full min-h-[240px] w-full rounded-[20px] border border-[#E8E8E8] bg-neutral-100"
                aria-hidden
              />
            )}
          </Link>

          <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-3 px-7 py-6 lg:px-8 lg:py-7">
            <HealthFeatureDetails {...detailsProps} footerLayout="desktop" />
          </div>
        </div>
      ) : (
        <div className="grid h-full min-h-[440px] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-3 p-5">
          <HealthFeatureDetails {...detailsProps} footerLayout="mobile" />
        </div>
      )}
    </article>
  );
};

export default HealthFeatureCard;
