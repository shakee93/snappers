"use client";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
  Brand,
  ProductAttribute,
  ProductCategory,
  ProductVariation,
  SimpleProduct,
  StockStatusEnum,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { twMerge } from "tailwind-merge";
import { useImage } from "@/context/ImageChangeGrabber";
import { getCategoryPath, getProductPath } from "@/lib/productUrl";
import ProductStarRating from "@/components/product/ProductStarRating";
import ProductTrustBadges from "@/components/product/ProductTrustBadges";
import ProductPaymentOptions from "@/components/product/ProductPaymentOptions";
import ProductPurchaseAccordions from "@/components/product/ProductPurchaseAccordions";
import BrandLogo from "@/components/product/BrandLogo";
import {
  stripReviewHtml,
} from "@/lib/productReviews";
import { useUnresolvedFreeGifts } from "@/hooks/useUnresolvedFreeGifts";
import { usePriceFluctuationNotice } from "@/hooks/usePriceFluctuationNotice";
import { useFreeGiftProducts } from "@/hooks/useFreeGiftProducts";
import { useProductStock } from "@/hooks/useProductStock";
import { Flame, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { resolveBogoConfig } from "@/lib/bogo";
import {
  isSimpleProductFreeShipping,
  isVariationFreeShipping,
} from "@/lib/freeShipping";
import { siteConfig } from "@/site.config";
import { toDisplayCurrency } from "@/lib/formatPrice";
import {
  findVariationByOption,
  isVariationOptionSelected,
  normalizeAttrName,
  variationsForOption,
} from "@/lib/productVariationMatch";
import {
  getPreferredVariation,
  getVariationNumericPrice,
} from "@/lib/getPreferredVariation";

const ProductDetails = ({
  product,
  brand,
}: {
  product: VariableProduct & SimpleProduct;
  brand: Brand;
}) => {
  const {
    product: { attribute },
    setAttribute,
    clearAttributes,
    setActiveVariationId,
  } = useStore();

  const preferredVariation = getPreferredVariation(product?.variations?.nodes);
  const productVariations =
    ((product as VariableProduct).variations?.nodes as ProductVariation[]) ?? [];
  const productAttributeNodes =
    (product.attributes?.nodes ?? []) as ProductAttribute[];
  const defaultVariation = preferredVariation ?? null;

  const sortedAttributeOptions = useMemo(() => {
    return productAttributeNodes.map((attr) => {
      const options = (attr.options ?? []).filter(
        (option): option is string => !!option,
      );

      const sorted = [...options].sort((a, b) => {
        const priceForOption = (option: string) => {
          const matches = variationsForOption(
            productVariations,
            option,
            attr,
            productAttributeNodes,
          );
          if (!matches.length) return Number.POSITIVE_INFINITY;
          return Math.min(...matches.map(getVariationNumericPrice));
        };

        return priceForOption(a) - priceForOption(b);
      });

      return { attr, options: sorted };
    });
  }, [productAttributeNodes, productVariations]);

  const [activeVariation, setActiveVariation] = useState<ProductVariation | null>(
    defaultVariation,
  );

  const { setVariationId } = useImage();

  useEffect(() => {
    clearAttributes();

    if (product.type !== "VARIABLE" || !defaultVariation) return;

    defaultVariation.attributes?.nodes?.forEach((attr: VariationAttribute) => {
      setAttribute(attr, attr.value || "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only init
  }, []);

  // Sync the active variation's ID to the store on a primitive dep so the
  // write fires only when the ID actually changes — keeps subscribers
  // (FreeGiftPreview) from re-rendering on no-op activeVariation updates.
  const activeVariationDbId =
    (activeVariation as { databaseId?: number } | null | undefined)?.databaseId ?? null;
  useEffect(() => {
    setActiveVariationId(activeVariationDbId);
  }, [activeVariationDbId, setActiveVariationId]);

  useEffect(() => {
    if (activeVariation?.image?.databaseId) {
      setVariationId(String(activeVariation.image.databaseId));
    }
  }, [activeVariation?.image?.databaseId, setVariationId]);

  const activeAttr = useCallback(
    (attr: ProductAttribute) => {
      return attribute.find(
        (a) =>
          a.name === attr.name ||
          normalizeAttrName(a.name) === normalizeAttrName(attr.name) ||
          normalizeAttrName(a.label) === normalizeAttrName(attr.label),
      );
    },
    [attribute],
  );

  const { simpleStockStatus, getVariationStockStatus } = useProductStock(product.slug);

  const resolveVariationStockStatus = useCallback(
    (variation: ProductVariation | null | undefined) => {
      if (!variation) return undefined;
      return (
        getVariationStockStatus(variation.databaseId) ?? variation.stockStatus
      );
    },
    [getVariationStockStatus],
  );

  const displayVariation = useMemo((): ProductVariation | null => {
    const base = activeVariation ?? defaultVariation;
    if (!base) return null;
    const freshStatus = getVariationStockStatus(base.databaseId);
    if (!freshStatus) return base;
    return {
      ...base,
      stockStatus: freshStatus as StockStatusEnum,
    };
  }, [activeVariation, defaultVariation, getVariationStockStatus]);

  const selectVariation = useCallback(
    (attr: ProductAttribute, option: string) => {
      const matched = findVariationByOption(
        productVariations,
        option,
        attr,
        productAttributeNodes,
      );

      if (!matched) return;

      setActiveVariation(matched);

      if (matched.image?.databaseId) {
        setVariationId(String(matched.image.databaseId));
      }

      matched.attributes?.nodes?.forEach((node) => {
        const variationAttr = node as VariationAttribute;
        setAttribute(variationAttr, variationAttr.value || "");
      });
    },
    [productAttributeNodes, productVariations, setAttribute, setVariationId],
  );

  const { isPriceFluctuation } = usePriceFluctuationNotice();
  // Variation meta wins, parent is the fallback — mirrors the WP plugin's
  // runtime rule resolution so per-variation BOGO offers render correctly.
  const bogo = useMemo(
    () => resolveBogoConfig(product, activeVariation),
    [product, activeVariation]
  );
  const isFreeGiftProduct = product?.productTags?.nodes?.some(
    (tag: any) => tag.slug === 'free-gift'
  ) ?? false;
  // Match the WP plugin's per-variation eligibility (`cart_item_has_free_shipping`):
  // variation meta wins, parent meta is the fallback. Using only the parent
  // `free-shipping` tag would show the badge for every variant whenever any
  // sibling variation qualifies.
  const isFreeShippingProduct = useMemo(() => {
    if (product?.type === "VARIABLE") {
      return isVariationFreeShipping(activeVariation, product);
    }
    return isSimpleProductFreeShipping(product);
  }, [product, activeVariation]);
  // If the BOGO rule resolved from the variation (variation `_wc_bogo_enabled`
  // wins), the fallback for an empty `_wc_bogo_free_product_ids` becomes the
  // variation's own ID — strip it from the cross-product list so we don't
  // try to load it as a separate gift product.
  const bogoSourceId = useMemo(() => {
    const variationId = (activeVariation as { databaseId?: number } | null | undefined)?.databaseId;
    if (
      variationId &&
      bogo.freeProductIds.length === 1 &&
      bogo.freeProductIds[0] === variationId
    ) {
      return variationId;
    }
    return product?.databaseId;
  }, [activeVariation, bogo.freeProductIds, product?.databaseId]);
  const crossProductFreeIds = bogo.freeProductIds.filter(
    (id) => id !== bogoSourceId
  );
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

  type FreeGiftMention = {
    key: string | number;
    name: string;
    href?: string | null;
  };

  const giftMentions = useMemo<FreeGiftMention[]>(
    () => [
      ...freeGiftNodes.map(
        (
          p: {
            databaseId?: number;
            name?: string | null;
            slug?: string | null;
            brands?: { nodes?: { slug?: string | null }[] };
          },
          i: number
        ): FreeGiftMention => {
          const href = p.slug ? getProductPath(p) : null;
          return {
            key: p.databaseId ?? `r-${i}`,
            name: p.name ?? "Free gift",
            href,
          };
        }
      ),
      ...unresolvedResolved.map(
        (r): FreeGiftMention => ({
          key: r.databaseId ?? `u-${r.id}`,
          name: r.name,
          href: r.href ?? null,
        })
      ),
    ],
    [freeGiftNodes, unresolvedResolved]
  );

  const freeGiftDetailLine =
    crossProductFreeIds.length === 0 ? (
      <>Free item applies to this product</>
    ) : freeGiftLoading || unresolvedLoading ? (
      <>Loading free gift details…</>
    ) : giftMentions.length > 0 ? (
      <>
        Free gift included:{" "}
        {giftMentions.map((entry, i) => (
          <span key={entry.key}>
            {i > 0 ? ", " : null}
            {entry.href ? (
              <Link
                href={entry.href}
                className="font-medium text-primary-500 underline"
              >
                {entry.name}
              </Link>
            ) : (
              <span className="font-medium">{entry.name}</span>
            )}
          </span>
        ))}
      </>
    ) : null;

  const showPromoTags = useMemo(() => {
    const hasClearance = product?.productTags?.nodes?.some(
      (tag) => tag && "slug" in tag && tag.slug === "clearance",
    );
    return (
      hasClearance ||
      isFreeShippingProduct ||
      (bogo.isBogoEnabled && freeGiftDetailLine !== null)
    );
  }, [
    product?.productTags?.nodes,
    isFreeShippingProduct,
    bogo.isBogoEnabled,
    freeGiftDetailLine,
  ]);

  // Compute availability message for unavailable combinations
  const availabilityMessage = useMemo(() => {
    if (
      product.type !== "VARIABLE" ||
      (displayVariation &&
        resolveVariationStockStatus(displayVariation) === "IN_STOCK") ||
      !product.attributes?.nodes ||
      product.attributes.nodes.length <= 1
    ) {
      return null;
    }

    // Find available alternatives for each attribute
    const availabilityMessages: Array<{ attr: ProductAttribute; availableValues: string[] }> = [];

    product.attributes.nodes.forEach((attr: ProductAttribute) => {
      const selectedValue = activeAttr(attr)?.val;
      if (!selectedValue) return;

      // Get all variations that match the other attributes but have different values for this attribute
      const otherAttributes = attribute.filter(
        (a) => normalizeAttrName(a.name) !== normalizeAttrName(attr.name),
      );
      const availableValues = new Set<string>();

      (product as VariableProduct).variations?.nodes.forEach((v: ProductVariation) => {
        // Check if this variation matches all other selected attributes
        const matchesOtherAttributes = otherAttributes.every((selectedAttr) => {
          return v.attributes?.nodes.some(
            (node: VariationAttribute) =>
              normalizeAttrName(node.name) === normalizeAttrName(selectedAttr.name) &&
              node.value === selectedAttr.val,
          );
        });

        // If it matches other attributes and is in stock, get the value for this attribute
        if (
          matchesOtherAttributes &&
          resolveVariationStockStatus(v) === "IN_STOCK"
        ) {
          const attrValue = v.attributes?.nodes?.find(
            (node: VariationAttribute) =>
              normalizeAttrName(node.name) === normalizeAttrName(attr.name),
          )?.value;
          if (attrValue && attrValue !== selectedValue) {
            // Custom (non-taxonomy) attributes: the value is the display label.
            availableValues.add(attrValue);
          }
        }
      });

      if (availableValues.size > 0) {
        availabilityMessages.push({
          attr,
          availableValues: Array.from(availableValues),
        });
      }
    });

    // Return message for the first attribute with available alternatives
    if (availabilityMessages.length > 0) {
      const { attr, availableValues } = availabilityMessages[0];
      return { attr, availableValues };
    }

    return null;
  }, [product, displayVariation, attribute, activeAttr, resolveVariationStockStatus]);

  const displayPriceHtml = useMemo(() => {
    if (product.type === "VARIABLE") {
      if (displayVariation?.price) {
        return toDisplayCurrency(displayVariation.price);
      }
      return "";
    }
    if (product.price) {
      return toDisplayCurrency(product.price);
    }
    return "";
  }, [product, displayVariation]);

  const displayRegularPriceHtml = useMemo(() => {
    if (product.type === "VARIABLE") {
      if (displayVariation?.regularPrice) {
        return toDisplayCurrency(displayVariation.regularPrice);
      }
      return "";
    }
    if (product.regularPrice) {
      return toDisplayCurrency(product.regularPrice);
    }
    return "";
  }, [product, displayVariation]);

  const displayNumericPrice = useMemo(() => {
    const raw =
      product.type === "VARIABLE" && displayVariation
        ? displayVariation.salePrice &&
          displayVariation.salePrice !== displayVariation.regularPrice
          ? displayVariation.salePrice
          : displayVariation.price
        : product.price;
    return parseFloat((raw || "0").toString().replace(/[^\d.]/g, "")) || 0;
  }, [product, displayVariation]);

  const isOnSale = useMemo(() => {
    if (product.type === "VARIABLE" && displayVariation) {
      return (
        !!displayVariation.salePrice &&
        displayVariation.salePrice !== displayVariation.regularPrice
      );
    }
    return !!product.salePrice && product.salePrice !== product.regularPrice;
  }, [product, displayVariation]);

  const isInStock = useMemo(() => {
    if (product.type === "VARIABLE") {
      if (!displayVariation) return false;
      return resolveVariationStockStatus(displayVariation) === "IN_STOCK";
    }
    return (simpleStockStatus ?? product.stockStatus) === "IN_STOCK";
  }, [product, displayVariation, resolveVariationStockStatus, simpleStockStatus]);

  const shortDescriptionText = useMemo(() => {
    if (!product.shortDescription) return "";
    const text = stripReviewHtml(product.shortDescription);
    return text.trim();
  }, [product.shortDescription]);

  return (
    <div className="flex flex-col gap-3 lg:gap-0">
      {isPriceFluctuation && (
        <div className="rounded-xl bg-red-500 p-4 text-sm text-white">
          Prices are being updated. For current pricing, please contact us on WhatsApp{" "}
          {siteConfig.contact.primaryPhone} / {siteConfig.contact.secondaryPhone}.
        </div>
      )}

      <div className="flex flex-col gap-2 pb-2 lg:pb-4">
        <BrandLogo
          brand={brand}
          imageClassName="h-10 w-auto max-w-[220px] object-contain object-left"
        />

        <h1 className="text-[26px] font-bold leading-snug text-[#38461F] sm:text-[28px]">
          {product.name}
        </h1>

        {shortDescriptionText && (
          <p className="text-sm leading-relaxed text-[#1A1A1A]">{shortDescriptionText}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <ProductStarRating
            averageRating={
              (product as SimpleProduct & { averageRating?: number | null })
                .averageRating
            }
            reviewCount={product.reviewCount}
            labelMode="rated"
            showWhenEmpty
          />

          {product.productCategories?.edges &&
            product.productCategories.edges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
                <span>Category:</span>
                {product.productCategories.edges.map((category, index) => {
                  const node = category.node as ProductCategory | null | undefined;
                  return (
                    <Link
                      href={getCategoryPath(node?.slug ?? "")}
                      key={node?.slug ?? index}
                      className="rounded-full border border-[#D1D5DB] px-3 py-1 text-xs font-medium text-[#374151] hover:border-[#38461F]"
                    >
                      {node?.name}
                    </Link>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {showPromoTags && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {product?.productTags?.nodes?.some(
              (tag) => tag && "slug" in tag && tag.slug === "clearance",
            ) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                <Flame className="h-3 w-3" />
                Clearance
              </span>
            )}
            {isFreeShippingProduct && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#38461F] px-2.5 py-0.5 text-xs font-semibold text-white">
                <Truck className="h-3 w-3" />
                Free Shipping
              </span>
            )}
            {bogo.isBogoEnabled && freeGiftDetailLine !== null && (
              <span className="inline-flex items-center rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white">
                {isFreeGiftProduct ? "Free Gift" : bogo.label}
              </span>
            )}
          </div>

          {bogo.isBogoEnabled && freeGiftDetailLine !== null && (
            <p className="text-sm text-[#6B7280]">{freeGiftDetailLine}</p>
          )}
        </>
      )}

      {product.type === "VARIABLE" && (
        <div
          id="product-attributes"
          className="space-y-4 border-t border-b border-[#E8E8E8] py-4"
        >
          {sortedAttributeOptions.map(({ attr, options }, index) => (
            <div key={index}>
              <p className="mb-3 text-sm font-bold text-[#38461F]">
                {options.length} {attr.label || attr.name}(s):
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = isVariationOptionSelected(
                    displayVariation,
                    option,
                    attr,
                    productAttributeNodes,
                  );
                  const matching = variationsForOption(
                    productVariations,
                    option,
                    attr,
                    productAttributeNodes,
                  );
                  const outOfStock =
                    matching.length > 0 &&
                    matching.every(
                      (v) => resolveVariationStockStatus(v) !== "IN_STOCK",
                    );

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => selectVariation(attr, option || "")}
                      className={twMerge(
                        "rounded-[10px] border border-[#38461F1A] bg-white px-4 py-2 text-sm font-semibold text-[#38461F] transition-colors",
                        isSelected
                          ? "border-[#38461F] bg-[#38461F]/20"
                          : "border-[#0000001A] hover:border-[#38461F]/50",
                        outOfStock && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {availabilityMessage && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden text-sm text-[#6B7280]"
          >
            <span className="font-medium">Unavailable.</span> In-stock{" "}
            {availabilityMessage.attr.label?.toLowerCase()}:{" "}
            <span className="font-medium text-[#38461F]">
              {availabilityMessage.availableValues.join(", ")}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {displayPriceHtml ? (
        <div className="space-y-1 pt-1 lg:py-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <span
              className="text-2xl font-bold text-[#38461F] sm:text-3xl"
              dangerouslySetInnerHTML={{ __html: displayPriceHtml }}
            />
            {isOnSale && displayRegularPriceHtml && (
              <span
                className="text-lg text-[#9CA3AF] line-through"
                dangerouslySetInnerHTML={{ __html: displayRegularPriceHtml }}
              />
            )}
          </div>
          {isInStock ? (
            <p className="flex items-center gap-2 text-sm font-medium text-[#2DC014]">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[#2DC014] animate-pulse"
                aria-hidden
              />
              In Stock
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm font-medium text-[#DC2626]">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]"
                aria-hidden
              />
              Out of stock
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm font-medium text-[#6B7280]">Currently unavailable</p>
      )}

      <ProductTrustBadges />

      {displayNumericPrice > 0 && (
        <ProductPaymentOptions numericPrice={displayNumericPrice} />
      )}

      <ProductPurchaseAccordions product={product} />

      <div className="max-lg:h-0 max-lg:overflow-visible">
        <ProductAddToCart
          product={product}
          variation={
            (displayVariation ?? defaultVariation) as ProductVariation & {
              rawPrice: string;
            }
          }
        />
      </div>
    </div>
  );
};

export default ProductDetails;
