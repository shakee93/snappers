"use client";

import { useCallback, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "sonner";
import { useCart } from "@/context/CartProvider";
import {
  GET_REORDER_PRODUCT_STOCK,
  type GetReorderProductStockQuery,
  type MyOrder,
  type ReorderProductStock,
} from "@/graphql/defs/order";
import {
  collectReorderProductIds,
  filterReorderForCart,
  getReorderCandidates,
  type ReorderCartLine,
} from "@/lib/reorderOrder";

function reorderEmptyMessage(
  skipped: Array<{ name: string; reason: string }>,
): string {
  if (skipped.length === 1 && skipped[0].reason === "out_of_stock") {
    return `${skipped[0].name} is currently out of stock.`;
  }

  const allOutOfStock =
    skipped.length > 0 &&
    skipped.every((item) => item.reason === "out_of_stock");

  return allOutOfStock
    ? "None of the items from this order are currently in stock."
    : "These items are no longer available to reorder.";
}

export function useReorderOrder() {
  const client = useApolloClient();
  const { addToCart, cart, setIsCartOpen } = useCart();
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const reorder = useCallback(
    async (order: MyOrder): Promise<boolean> => {
      if (inFlightRef.current) return false;

      inFlightRef.current = true;
      setReorderingId(order.id);

      try {
        const lineItems = order.lineItems?.nodes ?? [];
        const productIds = collectReorderProductIds(lineItems);
        let liveStock: Array<ReorderProductStock | null> | undefined;

        if (productIds.length > 0) {
          try {
            const stockResult = await client.query<GetReorderProductStockQuery>({
              query: GET_REORDER_PRODUCT_STOCK,
              variables: { ids: productIds },
              fetchPolicy: "network-only",
              errorPolicy: "all",
            });

            if (
              (stockResult.errors?.length ?? 0) > 0 &&
              !stockResult.data?.products
            ) {
              toast.error(
                "Unable to check stock for this order. Please try again.",
              );
              return false;
            }

            liveStock = stockResult.data?.products?.nodes ?? [];
          } catch {
            toast.error(
              "Unable to check stock for this order. Please try again.",
            );
            return false;
          }
        }

        const cartLines = (cart?.contents?.nodes ?? []) as ReorderCartLine[];
        const { add: stocked, skipped } = getReorderCandidates(
          lineItems,
          cartLines,
          liveStock,
        );
        const { add, blockedByPreOrder } = filterReorderForCart(
          stocked,
          cartLines,
        );

        if (add.length === 0) {
          if (blockedByPreOrder) {
            toast.error(
              "You can't mix pre-order products with regular products in your cart.",
            );
            return false;
          }

          toast.error(reorderEmptyMessage(skipped));
          return false;
        }

        let added = 0;
        let failed = 0;

        for (const item of add) {
          const result = await addToCart(
            item.productId,
            item.quantity,
            item.variationId,
            item.productData,
            { openCart: false, suppressErrorToast: true },
          );

          if (!result || ("error" in result && result.error)) {
            failed += 1;
          } else {
            added += 1;
          }
        }

        const skippedOutOfStock = skipped.filter(
          (item) => item.reason === "out_of_stock",
        ).length;

        if (added > 0) {
          if (blockedByPreOrder) {
            toast.info(
              "Some pre-order items were skipped because they can't be mixed with regular products.",
            );
          }
          setIsCartOpen(true);
          if (skippedOutOfStock > 0 || failed > 0) {
            const skippedParts: string[] = [];
            if (skippedOutOfStock > 0) {
              skippedParts.push(
                `${skippedOutOfStock} out of stock`,
              );
            }
            if (failed > 0) {
              skippedParts.push(
                `${failed} could not be added`,
              );
            }
            toast.success(
              `Added ${added} item${added === 1 ? "" : "s"} to your cart. ${skippedParts.join("; ")}.`,
            );
          } else {
            toast.success(
              added === 1
                ? "Item added to your cart."
                : `Added ${added} items to your cart.`,
            );
          }
          return true;
        }

        toast.error(
          failed > 0
            ? "None of the items from this order could be added to your cart."
            : reorderEmptyMessage(skipped),
        );
        return false;
      } finally {
        inFlightRef.current = false;
        setReorderingId(null);
      }
    },
    [addToCart, cart?.contents?.nodes, client, setIsCartOpen],
  );

  return { reorder, reorderingId };
}
