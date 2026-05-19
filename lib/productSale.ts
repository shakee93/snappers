// Parse a WooCommerce/WPGraphQL formatted price string (e.g. "Rs&nbsp;1,299.00")
// to a plain Number. Returns NaN for non-strings so downstream `> 0` guards
// reject the value safely. Exported so callers don't reinvent the regex.
export const parsePriceString = (value: unknown): number => {
  if (typeof value !== "string") return NaN;
  return parseFloat(value.replace(/[^\d.]/g, ""));
};

export interface ResolvedSale {
  regular: number;
  sale: number;
  /** Discount rounded to the nearest 5% — what the badge actually renders. */
  roundedPercent: number;
}

// Minimal shape `resolveProductSale` reads from a product. Kept narrow on
// purpose so both Apollo-typed objects and loose Typesense hits satisfy it
// without an unsafe cast at the call site.
interface SaleVariationInput {
  price?: string | null;
  salePrice?: string | null;
  regularPrice?: string | null;
  stockStatus?: string | null;
}

export interface SaleResolvableProduct {
  type?: string | null;
  salePrice?: string | null;
  regularPrice?: string | null;
  variations?: { nodes?: ReadonlyArray<SaleVariationInput | null | undefined> | null } | null;
}

const finalize = (regular: number, sale: number): ResolvedSale | null => {
  const raw = ((regular - sale) / regular) * 100;
  const roundedPercent = Math.round(raw / 5) * 5;
  return roundedPercent > 0 ? { regular, sale, roundedPercent } : null;
};

/**
 * Resolve the visible discount for a product card. Falls back from parent
 * salePrice/regularPrice (reliable on SIMPLE products) to the largest in-stock
 * variation percentage discount — VARIABLE products often leave parent prices
 * empty even when individual variations are discounted, and the storefront
 * already trusts this fallback to drive the % OFF badge.
 *
 * Returns null when no in-stock variation has a discount that rounds above 0%,
 * which doubles as the predicate for filtering out Typesense `onSale:true`
 * hits that have no actual discount left.
 */
export const resolveProductSale = (product: SaleResolvableProduct): ResolvedSale | null => {
  const parentSale = parsePriceString(product.salePrice);
  const parentRegular = parsePriceString(product.regularPrice);
  if (parentSale > 0 && parentRegular > 0 && parentSale < parentRegular) {
    const resolved = finalize(parentRegular, parentSale);
    if (resolved) return resolved;
  }

  if (product.type !== "VARIABLE" || !product.variations?.nodes) return null;

  let best: { regular: number; sale: number; ratio: number } | null = null;
  for (const v of product.variations.nodes) {
    if (!v || v.stockStatus !== "IN_STOCK") continue;
    const regular = parsePriceString(v.regularPrice);
    const sale = parsePriceString(v.salePrice ?? v.price);
    if (regular > 0 && sale > 0 && sale < regular) {
      const ratio = (regular - sale) / regular;
      if (!best || ratio > best.ratio) {
        best = { regular, sale, ratio };
      }
    }
  }
  return best ? finalize(best.regular, best.sale) : null;
};
