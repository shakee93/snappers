import { isLineItemFree } from "@/lib/cartLinePricing";
import type {
  MyOrderLineItem,
  ReorderProductStock,
} from "@/graphql/defs/order";

export type ReorderCartLine = {
  quantity?: number | null;
  product?: {
    node?: {
      databaseId?: number | null;
      productTags?: {
        nodes?: Array<{ slug?: string | null } | null> | null;
      } | null;
    } | null;
  } | null;
  variation?: { node?: { databaseId?: number | null } | null } | null;
};

export type ReorderAddItem = {
  productId: number;
  variationId?: number;
  quantity: number;
  name: string;
  isPreOrder: boolean;
  productData: {
    productTags?: {
      nodes?: Array<{ slug?: string | null } | null> | null;
    } | null;
  };
};

export type ReorderSkipReason = "unavailable" | "out_of_stock" | "free_gift";

export type ReorderSkip = {
  name: string;
  reason: ReorderSkipReason;
};

export function isPreOrderTagged(
  tags?: Array<{ slug?: string | null } | null> | null,
): boolean {
  return tags?.some((tag) => tag?.slug === "pre-order") ?? false;
}

function cartQuantityFor(
  cartLines: ReorderCartLine[],
  productId: number,
  variationId?: number,
): number {
  return cartLines.reduce((sum, line) => {
    const lineProductId = line.product?.node?.databaseId;
    const lineVariationId = line.variation?.node?.databaseId ?? undefined;

    if (variationId != null) {
      return lineVariationId === variationId ? sum + (line.quantity ?? 0) : sum;
    }

    return lineProductId === productId && lineVariationId == null
      ? sum + (line.quantity ?? 0)
      : sum;
  }, 0);
}

export function collectReorderProductIds(
  items: Array<MyOrderLineItem | null | undefined>,
): number[] {
  const ids = new Set<number>();
  for (const item of items) {
    const id = item?.productId ?? item?.product?.node?.databaseId;
    if (id) ids.add(id);
  }
  return Array.from(ids);
}

function stockMapFromNodes(
  nodes?: Array<ReorderProductStock | null> | null,
): Map<number, ReorderProductStock> {
  const map = new Map<number, ReorderProductStock>();
  for (const node of nodes ?? []) {
    if (node?.databaseId != null) map.set(node.databaseId, node);
  }
  return map;
}

function isPurchasableStockStatus(status: string | null | undefined): boolean {
  return status === "IN_STOCK" || status === "ON_BACKORDER";
}

/** Paid, in-stock (or backorder) order lines that can be added back to the cart. */
export function getReorderCandidates(
  items: Array<MyOrderLineItem | null | undefined>,
  cartLines: ReorderCartLine[] = [],
  liveStock?: Array<ReorderProductStock | null> | null,
): { add: ReorderAddItem[]; skipped: ReorderSkip[] } {
  const add: ReorderAddItem[] = [];
  const skipped: ReorderSkip[] = [];
  const pendingQty = new Map<string, number>();
  const stockById = stockMapFromNodes(liveStock);
  // `liveStock != null` means a stock query ran (even if it returned []).
  const stockChecked = liveStock != null;

  for (const item of items) {
    const product = item?.product?.node;
    const name = product?.name?.trim() || "Product";

    if (!item) {
      skipped.push({ name, reason: "unavailable" });
      continue;
    }

    if (isLineItemFree(item.total, item.subtotal)) {
      skipped.push({ name, reason: "free_gift" });
      continue;
    }

    const productId = item.productId ?? product?.databaseId ?? null;
    if (!productId) {
      skipped.push({ name, reason: "unavailable" });
      continue;
    }

    const live = stockById.get(productId);
    const displayName = live?.name?.trim() || name;

    // After a live stock check, missing products are unavailable - not assumed
    // in-stock. Prefer "unavailable" over OOS so messaging stays accurate.
    if (stockChecked && !live) {
      skipped.push({ name: displayName, reason: "unavailable" });
      continue;
    }

    const isVariable = live?.type === "VARIABLE" || product?.type === "VARIABLE";
    const variationId =
      item.variation?.node?.databaseId ?? item.variationId ?? undefined;

    if (isVariable && variationId == null) {
      skipped.push({ name: displayName, reason: "unavailable" });
      continue;
    }

    if (live?.purchasable === false || product?.purchasable === false) {
      skipped.push({ name: displayName, reason: "unavailable" });
      continue;
    }

    const variationStock = live?.variations?.nodes?.find(
      (variation) => variation?.databaseId === variationId,
    );

    // Never fall back to parent stock for a variation once live data is loaded -
    // parent IN_STOCK would let OOS / missing variations through to addToCart.
    if (stockChecked && isVariable && !variationStock) {
      skipped.push({ name: displayName, reason: "unavailable" });
      continue;
    }

    const stockStatus = isVariable
      ? (variationStock?.stockStatus ?? item.variation?.node?.stockStatus)
      : (live?.stockStatus ?? product?.stockStatus);
    const stockQuantity = isVariable
      ? (variationStock?.stockQuantity ?? item.variation?.node?.stockQuantity)
      : (live?.stockQuantity ?? product?.stockQuantity);
    const onBackorder = stockStatus === "ON_BACKORDER";

    if (stockChecked) {
      if (!isPurchasableStockStatus(stockStatus)) {
        skipped.push({ name: displayName, reason: "out_of_stock" });
        continue;
      }
    } else if (stockStatus && !isPurchasableStockStatus(stockStatus)) {
      skipped.push({ name: displayName, reason: "out_of_stock" });
      continue;
    }

    const requested = Math.max(1, item.quantity ?? 1);
    const key = variationId != null ? `v:${variationId}` : `p:${productId}`;
    const reserved =
      cartQuantityFor(cartLines, productId, variationId) +
      (pendingQty.get(key) ?? 0);

    let quantity = requested;
    // Backordered items often report stockQuantity 0/negative but Woo still sells them.
    if (!onBackorder && stockQuantity != null) {
      const available = stockQuantity - reserved;
      if (available <= 0) {
        skipped.push({ name: displayName, reason: "out_of_stock" });
        continue;
      }
      quantity = Math.min(requested, available);
    }

    pendingQty.set(key, (pendingQty.get(key) ?? 0) + quantity);

    add.push({
      productId,
      variationId,
      quantity,
      name: displayName,
      isPreOrder: isPreOrderTagged(
        live?.productTags?.nodes ?? product?.productTags?.nodes,
      ),
      productData: {
        productTags: live?.productTags ?? product?.productTags,
      },
    });
  }

  return { add, skipped };
}

/** Cart cannot mix pre-order and regular products. Keep the compatible set. */
export function filterReorderForCart(
  items: ReorderAddItem[],
  cartLines: ReorderCartLine[],
): { add: ReorderAddItem[]; blockedByPreOrder: boolean } {
  const cartHasPreOrder = cartLines.some((line) =>
    isPreOrderTagged(line.product?.node?.productTags?.nodes),
  );
  const cartHasRegular = cartLines.some(
    (line) => !isPreOrderTagged(line.product?.node?.productTags?.nodes),
  );

  if (cartHasPreOrder) {
    const add = items.filter((item) => item.isPreOrder);
    return { add, blockedByPreOrder: add.length < items.length };
  }

  if (cartHasRegular) {
    const add = items.filter((item) => !item.isPreOrder);
    return { add, blockedByPreOrder: add.length < items.length };
  }

  const hasPreOrder = items.some((item) => item.isPreOrder);
  const hasRegular = items.some((item) => !item.isPreOrder);
  if (hasPreOrder && hasRegular) {
    return {
      add: items.filter((item) => !item.isPreOrder),
      blockedByPreOrder: true,
    };
  }

  return { add: items, blockedByPreOrder: false };
}
