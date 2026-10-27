// Derive the stock-aware quantity cap for a cart line.
//
// Variations are the source of truth for stock on variable products; the
// parent VariableProduct's stockQuantity / manageStock are always null on
// the WPGraphQL surface. For simple products, the parent product carries
// the stock fields directly.
//
// `manageStock` arrives as the WPGraphQL `ManageStockEnum`:
//   • "TRUE"   - stock is tracked, stockQuantity is the cap
//   • "FALSE"  - not tracked, no cap (NcInputNumber falls back to its
//                default of 99)
//   • "PARENT" - variation defers to parent; we treat it as "no cap"
//                here. Server-side stock check is the safety net.
//   • null     - not an InventoriedProduct (or VariableProduct parent)
//
// The cap is best-effort: stockQuantity is read at fragment-fetch time
// and can drift if WP stock changes between cart render and order
// submit. The checkout error handler (parseStockError) is the
// ultimate fallback - when WC rejects an order it surfaces a toast
// with the live available count.

type ManageStockEnum = "TRUE" | "FALSE" | "PARENT" | null | undefined;

interface StockBearingNode {
  stockQuantity?: number | null;
  manageStock?: ManageStockEnum;
}

interface CartLineLike {
  product?: { node?: { type?: string | null } & Partial<StockBearingNode> } | null;
  variation?: { node?: Partial<StockBearingNode> | null } | null;
}

export interface CartLineStockCap {
  /** Effective ceiling on quantity, or null when stock is not tracked. */
  maxQty: number | null;
  /** True when stockQuantity is being enforced (manageStock === "TRUE"). */
  isStockManaged: boolean;
  /** Whether `quantity` already sits at the cap. */
  atMax: (quantity: number) => boolean;
}

export function getCartLineStockCap(item: CartLineLike): CartLineStockCap {
  const productNode = item.product?.node;
  const variationNode = item.variation?.node;
  const stockNode: Partial<StockBearingNode> | null | undefined =
    productNode?.type === "VARIABLE" ? variationNode : productNode;

  const isStockManaged = stockNode?.manageStock === "TRUE";
  const stockQuantity = stockNode?.stockQuantity;
  const maxQty =
    isStockManaged && typeof stockQuantity === "number" ? stockQuantity : null;

  return {
    maxQty,
    isStockManaged,
    atMax: (quantity) => maxQty !== null && quantity >= maxQty,
  };
}
