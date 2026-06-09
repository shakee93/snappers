/**
 * Mirrors `wc-bogo-simple` plugin's `cart_item_has_free_shipping` priority:
 * variation meta wins; parent meta is the fallback only when the variation
 * has no saved value. An explicit variation `'no'` is final.
 *
 * Inputs are typed `unknown` because callers pass full GraphQL product/variation
 * shapes whose generated types don't expose the `freeShippingMeta` query alias.
 */

const FREE_SHIPPING_META_KEY = "_wc_product_free_shipping";

type MetaEntry = {
  key?: string | null;
  value?: string | null;
};

function readFreeShippingFlag(host: unknown): string | null {
  if (!host || typeof host !== "object") return null;
  const meta = (host as { freeShippingMeta?: unknown }).freeShippingMeta;
  if (!Array.isArray(meta)) return null;
  for (const entry of meta as ReadonlyArray<MetaEntry | null | undefined>) {
    if (entry?.key === FREE_SHIPPING_META_KEY) return entry.value ?? null;
  }
  return null;
}

export function isVariationFreeShipping(
  variation: unknown,
  parent: unknown,
): boolean {
  const v = readFreeShippingFlag(variation);
  if (v === "yes") return true;
  if (v === null || v === "") {
    return readFreeShippingFlag(parent) === "yes";
  }
  return false;
}

export function isSimpleProductFreeShipping(product: unknown): boolean {
  return readFreeShippingFlag(product) === "yes";
}
