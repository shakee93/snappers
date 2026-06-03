"use client";

import { useLazyQuery } from "@apollo/client";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import AttributeIcon from "@/components/global/primitives/AttributeIcon";
import { GET_CART_VARIATION_OPTIONS } from "@/graphql/defs/cart";
import { CartItem } from "@/graphql/types/graphql";
import {
  findVariationByAttributes,
  VariationAttributeSelection,
} from "@/lib/findVariationByAttributes";
import { getCartLineStockCap } from "@/lib/cartLineStockCap";

type CartLineVariationAttr = {
  name?: string | null;
  value?: string | null;
  displayValue?: string | null;
};

type CartVariationOptionAttribute = {
  name?: string | null;
  label?: string | null;
  options?: Array<string | null> | null;
};

type CartVariationOptionNode = {
  databaseId?: number | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  manageStock?: string | null;
  attributes?: {
    nodes?: Array<{ name?: string | null; value?: string | null }> | null;
  } | null;
};

type CartVariationOptionsProduct = {
  databaseId?: number;
  type?: string;
  attributes?: { nodes?: CartVariationOptionAttribute[] | null } | null;
  variations?: { nodes?: CartVariationOptionNode[] | null } | null;
};

function formatOptionLabel(option: string): string {
  return option
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface CartVariationPickerProps {
  cartItem: CartItem;
  onVariationChange: (
    cartItemKey: string,
    productId: number,
    newVariationId: number,
    quantity: number
  ) => Promise<unknown> | unknown;
  compact?: boolean;
}

const CartVariationPicker = ({
  cartItem,
  onVariationChange,
  compact = false,
}: CartVariationPickerProps) => {
  const { product, variation, quantity, key } = cartItem;
  const productNode = product?.node;
  const productId = productNode?.databaseId;
  const currentVariationId = variation?.node?.databaseId;

  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selections, setSelections] = useState<VariationAttributeSelection[]>([]);

  const [loadOptions, { data, loading: optionsLoading, called }] = useLazyQuery(
    GET_CART_VARIATION_OPTIONS,
    { fetchPolicy: "no-cache" }
  );

  const variableProduct = data?.product as CartVariationOptionsProduct | undefined;
  const attributes = variableProduct?.attributes?.nodes ?? [];
  const variations = variableProduct?.variations?.nodes ?? [];

  const initSelectionsFromCart = useCallback(() => {
    const fromCart =
      (variation?.attributes as CartLineVariationAttr[] | null | undefined)?.map(
        (attr) => ({
          name: attr?.name ?? "",
          val: attr?.value ?? "",
        })
      ) ?? [];
    setSelections(fromCart.filter((s) => s.name && s.val));
  }, [variation?.attributes]);

  useEffect(() => {
    if (isOpen && productId && !called) {
      void loadOptions({ variables: { productId: String(productId) } });
    }
  }, [isOpen, productId, called, loadOptions]);

  useEffect(() => {
    if (isOpen && called && !optionsLoading && attributes.length > 0) {
      initSelectionsFromCart();
    }
  }, [isOpen, called, optionsLoading, attributes.length, initSelectionsFromCart]);

  const matchedVariation = useMemo(
    () => findVariationByAttributes(variations, selections),
    [variations, selections]
  );

  const isOptionOutOfStock = (attrName: string, option: string) => {
    const matching = variations.filter((v) =>
      v.attributes?.nodes?.some(
        (node) => node.name === attrName && node.value === option
      )
    );
    return (
      matching.length > 0 &&
      matching.every((v) => v.stockStatus !== "IN_STOCK")
    );
  };

  const handleSelectChange = async (
    attr: CartVariationOptionAttribute,
    option: string
  ) => {
    if (isApplying || !productId) return;

    const lineQty = quantity ?? 1;

    const nextSelections = selections.filter((s) => s.name !== attr.name);
    nextSelections.push({ name: attr.name ?? "", val: option });
    setSelections(nextSelections);

    const nextVariation = findVariationByAttributes(variations, nextSelections);
    const nextVariationId = nextVariation?.databaseId;

    if (!nextVariationId || nextVariationId === currentVariationId) {
      return;
    }

    if (nextVariation.stockStatus !== "IN_STOCK") {
      toast.error("That option is out of stock.");
      return;
    }

    const cap = getCartLineStockCap({
      ...cartItem,
      variation: {
        node: {
          stockQuantity: nextVariation.stockQuantity,
          manageStock: nextVariation.manageStock as
            | "TRUE"
            | "FALSE"
            | "PARENT"
            | null
            | undefined,
        },
      },
    });
    if (cap.maxQty !== null && lineQty > cap.maxQty) {
      toast.error(
        `Only ${cap.maxQty} available for this option — reduce quantity first.`
      );
      return;
    }

    setIsApplying(true);
    try {
      await onVariationChange(
        key,
        productId,
        nextVariationId,
        lineQty
      );
      setIsOpen(false);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Couldn't update option. Please try again.";
      toast.error(message);
      initSelectionsFromCart();
    } finally {
      setIsApplying(false);
    }
  };

  if (productNode?.type !== "VARIABLE") {
    return null;
  }

  const buttonClass = compact
    ? "text-xs font-medium text-primary-600 hover:text-primary-500 underline-offset-2 hover:underline"
    : "text-sm font-medium text-primary-600 hover:text-primary-500 underline-offset-2 hover:underline";

  return (
    <div className={compact ? "mt-0.5" : "mt-1.5"}>
      {!isOpen ? (
        <div className={compact ? "space-y-0.5" : "space-y-1"}>
          <div
            className={
              compact
                ? "text-xs text-slate-500 dark:text-slate-400"
                : "text-sm text-slate-600 dark:text-slate-300"
            }
          >
            {(variation?.attributes as CartLineVariationAttr[] | null | undefined)?.map(
              (attr, index) => (
                <Fragment key={index}>
                  <div className="flex items-center gap-1">
                    <AttributeIcon name={attr?.name || ""} className="w-3.5" />
                    <span>{attr?.displayValue || attr?.value}</span>
                  </div>
                </Fragment>
              )
            )}
          </div>
          <button
            type="button"
            className={`relative z-10 ${buttonClass}`}
            onClick={() => setIsOpen(true)}
          >
            Change options
          </button>
        </div>
      ) : (
        <div
          className={
            compact
              ? "space-y-2 rounded-md border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-800/50"
              : "space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50"
          }
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={
                compact
                  ? "text-xs font-medium text-slate-700 dark:text-slate-200"
                  : "text-sm font-medium text-slate-700 dark:text-slate-200"
              }
            >
              Choose options
            </span>
            {(optionsLoading || isApplying) && (
              <Loader className="h-3.5 w-3.5 animate-spin text-slate-500" aria-hidden />
            )}
          </div>

          {optionsLoading ? (
            <p className="text-xs text-slate-500">Loading options…</p>
          ) : (
            attributes.map((attr, index) => {
              const selected =
                selections.find((s) => s.name === attr.name)?.val ?? "";
              return (
                <label key={index} className="block">
                  <span className="mb-1 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <AttributeIcon name={attr?.name || ""} className="w-3.5" />
                    {attr.label}
                  </span>
                  <select
                    className="form-select relative z-10 w-full rounded-md border-slate-200 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={selected}
                    disabled={isApplying}
                    onChange={(e) => void handleSelectChange(attr, e.target.value)}
                  >
                    <option value="" disabled>
                      Select {attr.label}
                    </option>
                    {attr.options?.map((option) => (
                      <option
                        key={option}
                        value={option ?? ""}
                        disabled={isOptionOutOfStock(attr.name ?? "", option ?? "")}
                      >
                        {formatOptionLabel(option ?? "")}
                        {isOptionOutOfStock(attr.name ?? "", option ?? "")
                          ? " (Out of stock)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })
          )}

          {matchedVariation &&
            matchedVariation.databaseId !== currentVariationId &&
            matchedVariation.stockStatus !== "IN_STOCK" && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This combination is out of stock.
              </p>
            )}

          <button
            type="button"
            className="relative z-10 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            disabled={isApplying}
            onClick={() => {
              setIsOpen(false);
              initSelectionsFromCart();
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CartVariationPicker;
