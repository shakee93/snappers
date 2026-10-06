"use client";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
  Brand,
  ProductAttribute,
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
import { getProductPath } from "@/lib/productUrl";
import ProductShareControls from "@/components/product/ProductShareControls";
import BrandLogo from "@/components/product/BrandLogo";
import {
  stripReviewHtml,
} from "@/lib/productReviews";
import { stripEmojis } from "@/lib/stripEmojis";
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
import { pdpRadius } from "@/components/product/pdpStyles";
import { parsePriceString, resolveProductSale } from "@/lib/productSale";
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
import { type ProductWithPriceTiers } from "@/lib/priceTiers";
import { getShortDescriptionBullets } from "@/lib/pdpShortDescription";
import { getProductCategories } from "@/lib/productUrl";

const PDP_GREEN = "#3BB77E";

const ProductDetails = ({
  product,
  brand,
}: {
  product: VariableProduct & SimpleProduct & ProductWithPriceTiers;
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

  const isOnSale = useMemo(() => {
    if (product.type === "VARIABLE" && displayVariation) {
      return (
        !!displayVariation.salePrice &&
        displayVariation.salePrice !== displayVariation.regularPrice
      );
    }
    return !!product.salePrice && product.salePrice !== product.regularPrice;
  }, [product, displayVariation]);

  const saleBadge = useMemo(() => {
    if (product.type === "VARIABLE" && displayVariation) {
      const regular = parsePriceString(displayVariation.regularPrice);
      const sale = parsePriceString(
        displayVariation.salePrice ?? displayVariation.price,
      );
      if (regular > 0 && sale > 0 && sale < regular) {
        const roundedPercent =
          Math.round((((regular - sale) / regular) * 100) / 5) * 5;
        return roundedPercent > 0 ? `${roundedPercent}% OFF!` : null;
      }
      return null;
    }

    const resolvedSale = resolveProductSale(product);
    return resolvedSale ? `${resolvedSale.roundedPercent}% OFF!` : null;
  }, [product, displayVariation]);

  const isInStock = useMemo(() => {
    if (product.type === "VARIABLE") {
      if (!displayVariation) return false;
      return resolveVariationStockStatus(displayVariation) === "IN_STOCK";
    }
    return (simpleStockStatus ?? product.stockStatus) === "IN_STOCK";
  }, [product, displayVariation, resolveVariationStockStatus, simpleStockStatus]);

  const stockCount = useMemo(() => {
    if (product.type === "VARIABLE") {
      return displayVariation?.stockQuantity ?? null;
    }
    return product.stockQuantity ?? null;
  }, [product, displayVariation]);

  const shortDescriptionBullets = useMemo(
    () => getShortDescriptionBullets(product.shortDescription),
    [product.shortDescription],
  );

  const categoryLabels = useMemo(() => {
    return getProductCategories(product)
      .map((c) => c.name)
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");
  }, [product]);

  const productSku =
    (product as SimpleProduct & { sku?: string | null }).sku?.trim() || null;

  return (
    <div className="flex flex-col gap-4">
      {isPriceFluctuation && (
        <div className={`bg-red-500 p-4 text-sm text-white ${pdpRadius}`}>
          Prices are being updated. For current pricing, please contact us on WhatsApp{" "}
          {siteConfig.contact.primaryPhoneDisplay}.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {saleBadge && (
          <span className="inline-flex w-fit rounded-md bg-[#FCE7F3] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#DB2777]">
            Sale!
          </span>
        )}

        <h1 className="text-xl font-bold leading-snug text-[#253D4E] sm:text-2xl lg:text-[26px]">
          {product.name}
        </h1>

        <BrandLogo
          brand={brand}
          imageClassName="h-8 w-auto max-w-[180px] object-contain object-left opacity-90"
        />
      </div>

      {showPromoTags && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {product?.productTags?.nodes?.some(
              (tag) => tag && "slug" in tag && tag.slug === "clearance",
            ) && (
              <span className={`inline-flex items-center gap-1 bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white ${pdpRadius}`}>
                <Flame className="h-3 w-3" />
                Clearance
              </span>
            )}
            {isFreeShippingProduct && (
              <span className={`inline-flex items-center gap-1 bg-[#38461F] px-2.5 py-0.5 text-xs font-semibold text-white ${pdpRadius}`}>
                <Truck className="h-3 w-3" />
                Free Shipping
              </span>
            )}
            {bogo.isBogoEnabled && freeGiftDetailLine !== null && (
              <span className={`inline-flex items-center bg-green-600 px-2.5 py-1 text-xs font-semibold text-white ${pdpRadius}`}>
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
                        `${pdpRadius} border border-[#38461F1A] bg-white px-4 py-2 text-sm font-semibold text-[#38461F] transition-colors`,
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

      {shortDescriptionBullets.length > 0 && (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-600">
          {shortDescriptionBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {displayPriceHtml ? (
        <div className="space-y-2 border-b border-neutral-100 pb-4">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            {isOnSale && displayRegularPriceHtml && (
              <span
                className="text-base text-neutral-400 line-through sm:text-lg"
                dangerouslySetInnerHTML={{ __html: displayRegularPriceHtml }}
              />
            )}
            <span
              className="text-2xl font-bold sm:text-3xl"
              style={{ color: PDP_GREEN }}
              dangerouslySetInnerHTML={{ __html: displayPriceHtml }}
            />
          </div>
          {isInStock ? (
            <p className="text-sm font-semibold text-[#F59E0B]">
              {stockCount != null && stockCount > 0
                ? `${stockCount} in stock`
                : "In stock"}
            </p>
          ) : (
            <p className="text-sm font-semibold text-[#DC2626]">Out of stock</p>
          )}
        </div>
      ) : (
        <p className="text-sm font-medium text-neutral-500">Currently unavailable</p>
      )}

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

      <ProductShareControls product={product} className="w-full" />

      {(productSku || categoryLabels) && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-2">
          {productSku && (
            <div>
              <dt className="font-semibold text-neutral-700">SKU</dt>
              <dd className="text-neutral-500">{productSku}</dd>
            </div>
          )}
          {categoryLabels && (
            <div>
              <dt className="font-semibold text-neutral-700">Categories</dt>
              <dd className="text-neutral-500">{categoryLabels}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
};

export default ProductDetails;
