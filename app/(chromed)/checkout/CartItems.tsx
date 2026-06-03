"use client";

import Image from "next/image";
import Link from "next/link";
import LineOrCartPriceLabel from "@/components/global/ui/LineOrCartPriceLabel";
import { Fragment, useMemo, useState } from "react";
import { Loader, Truck } from "lucide-react";
import { toast } from "sonner";
import AttributeIcon from "@/components/global/primitives/AttributeIcon";
import { isLineItemFree } from "@/lib/cartLinePricing";
import { getCartLineStockCap } from "@/lib/cartLineStockCap";
import {
  isSimpleProductFreeShipping,
  isVariationFreeShipping,
} from "@/lib/freeShipping";

export interface CartItem {
  extraData?: null | any;
  key: string;
  product: CartItemProduct;
  quantity: number;
  subtotal: string;
  subtotalTax: string;
  total: string;
  variation: null | any;
  type: null | any;
}

export interface CartItemProduct {
  node: CartItemProductNode;
}

export interface CartItemProductNode {
  id: number;
  name: string;
  price: number;
  regularPrice?: string;
  slug: string;
  type: string;
  image: {
    sourceUrl: string;
  };
  terms: string[];
  brands: {
    nodes: any;
  };
  freeShippingMeta?: Array<{ key?: string | null; value?: string | null }>;
}

interface CartItemsProps {
  item: CartItem;
  index: number;
  onQuantityChange: (key: string, quantity: number) => Promise<unknown> | unknown;
  onRemove: (keys: string[]) => Promise<unknown> | unknown;
}

const CartItems = ({
  item,
  index,
  onQuantityChange,
  onRemove,
}: CartItemsProps) => {
  const { product, quantity, key, subtotal, total, variation } = item;
  const lineIsFree = isLineItemFree(total, subtotal);
  const { node } = product || {};
  const { name, price, regularPrice, image, terms, brands, type } = node || {};
  // Match the WP plugin's per-variation eligibility: variation meta wins,
  // parent meta is the fallback. Same priority as cart_item_has_free_shipping.
  const hasFreeShipping = useMemo(() => {
    if (type === "VARIABLE") {
      return isVariationFreeShipping(variation?.node, node);
    }
    return isSimpleProductFreeShipping(node);
  }, [type, variation?.node, node]);
  const brandSlug = brands?.nodes[0]?.slug;

  const { maxQty, atMax } = getCartLineStockCap(item);
  const atMaxStock = atMax(quantity);

  const [isUpdatingQty, setIsUpdatingQty] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQty = async (newQty: number) => {
    if (isUpdatingQty || isRemoving || newQty === quantity) return;
    if (maxQty !== null && newQty > maxQty) {
      toast.error(
        `Only ${maxQty} of "${name}" available — please reduce the quantity.`
      );
      return;
    }
    setIsUpdatingQty(true);
    try {
      await onQuantityChange(key, newQty);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't update quantity. Please try again.");
    } finally {
      setIsUpdatingQty(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove([key]);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't remove item. Please try again.");
      setIsRemoving(false);
    }
  };

  const isBusy = isUpdatingQty || isRemoving;

  return (
    <div key={index} className="relative flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="relative h-20 w-20 flex-shrink-0">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/70 dark:ring-slate-700">
          <Image
            fill
            style={{ objectFit: "cover" }}
            src={product.node.type === "VARIABLE"
              ? variation?.node.image?.sourceUrl || ""
              : product.node.image?.sourceUrl || image?.sourceUrl || ""}
            alt={name}
            className="h-full w-full object-contain object-center"
          />
          <Link
            href={`/${brandSlug}/${product.node.slug}`}
            className="absolute inset-0"
            aria-label={name}
          />
        </div>
        <span className="absolute -top-1.5 -right-1.5 z-10 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold ring-2 ring-white dark:ring-slate-900 pointer-events-none">
          {quantity}
        </span>
      </div>

      <div className="flex flex-1 min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2">
            <Link href={`/${brandSlug}/${product.node.slug}`}>{name}</Link>
          </h3>

          {type === "VARIABLE" && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {variation?.attributes?.map((attr: any, idx: number) => (
                <Fragment key={idx}>
                  <span className="inline-flex items-center gap-1">
                    <AttributeIcon name={attr?.name || ""} className="w-3.5" />
                    <span>{attr?.displayValue || attr?.value}</span>
                  </span>
                </Fragment>
              ))}
            </div>
          )}

          {hasFreeShipping && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              <Truck className="w-3 h-3 shrink-0" />
              Free Shipping
            </div>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs">
            {!lineIsFree && (
              <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => handleQty(Math.max(1, quantity - 1))}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-l-md disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={quantity <= 1 || isBusy}
                >
                  −
                </button>
                <span className="px-2 min-w-[1.75rem] text-center font-medium text-slate-700 dark:text-slate-200 inline-flex items-center justify-center">
                  {isUpdatingQty ? (
                    <Loader className="w-3 h-3 animate-spin text-slate-500" aria-label="Updating" />
                  ) : (
                    quantity
                  )}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => handleQty(quantity + 1)}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-r-md disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isBusy || atMaxStock}
                  title={atMaxStock ? `Only ${maxQty} in stock` : undefined}
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="relative z-10 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              disabled={isBusy}
            >
              {isRemoving && <Loader className="w-3 h-3 animate-spin" />}
              {isRemoving ? "Removing…" : "Remove"}
            </button>
            {atMaxStock && !lineIsFree && (
              <span className="text-amber-600 dark:text-amber-400">
                Only {maxQty} in stock
              </span>
            )}
          </div>
        </div>

        <div
          className={`text-right shrink-0 transition-opacity ${
            isBusy ? "opacity-50" : "opacity-100"
          }`}
          aria-busy={isBusy}
        >
          <LineOrCartPriceLabel
            lineTotal={total}
            lineSubtotal={subtotal}
            showOriginalPrice={true}
            catalogPrice={type === "VARIABLE" ? variation?.node.price : price}
            catalogSalePrice={
              type === "VARIABLE" ? variation?.node.regularPrice : regularPrice
            }
            className="!flex-col !items-end !gap-0 text-sm font-semibold text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};

export default CartItems;
