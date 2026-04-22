type MetaEntry = {
  key?: string | null;
  value?: unknown;
};
type MetaEntryLike = MetaEntry | null | undefined;

export type BogoConfig = {
  isBogoEnabled: boolean;
  buyQty: number;
  getQty: number;
  maxFreeQty: number;
  freeProductIds: number[];
  label: string;
};

const DEFAULT_BUY_QTY = 1;
const DEFAULT_GET_QTY = 1;
const DEFAULT_MAX_FREE_QTY = 0;

function toPositiveIntOrDefault(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function toNonNegativeIntOrDefault(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function normalizeProductIds(value: unknown): number[] {
  const ids = new Set<number>();

  const pushId = (candidate: unknown) => {
    const id = Number.parseInt(String(candidate ?? "").trim(), 10);
    if (Number.isFinite(id) && id > 0) ids.add(id);
  };

  const parseString = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    try {
      const maybeJson = JSON.parse(text);
      if (Array.isArray(maybeJson)) {
        maybeJson.forEach(pushId);
        return;
      }
    } catch {
      // Not JSON; continue with comma and token parsing.
    }

    text.split(",").forEach(pushId);
    if (text.includes(",")) return;

    // PHP serialized arrays sometimes look like:
    // a:2:{i:0;s:3:"123";i:1;s:3:"456";}
    const serializedStringMatches = Array.from(
      text.matchAll(/s:\d+:"(\d+)"/g),
      (match) => match[1]
    );
    if (serializedStringMatches.length > 0) {
      serializedStringMatches.forEach(pushId);
      return;
    }

    // Serialized integer values can also appear as i:123;
    const serializedIntMatches = Array.from(
      text.matchAll(/i:(\d+);/g),
      (match) => match[1]
    );
    if (serializedIntMatches.length > 0) {
      serializedIntMatches.forEach(pushId);
      return;
    }

    // Plain single numeric value
    if (/^\d+$/.test(text)) {
      pushId(text);
    }
  };

  if (Array.isArray(value)) {
    value.forEach(pushId);
  } else if (typeof value === "string") {
    parseString(value);
  } else if (typeof value === "number") {
    pushId(value);
  }

  return Array.from(ids);
}

function getMetaValue(
  metaData: MetaEntryLike[] | null | undefined,
  key: string
): unknown {
  if (!metaData?.length) return undefined;
  const match = metaData.find((entry) => entry?.key === key);
  return match?.value;
}

/** WPGraphQL often omits private `_wc_*` keys from unfiltered `metaData`; merge explicit `keysIn` results. */
export function mergeProductMetaForBogo(product: {
  metaData?: MetaEntryLike[] | null;
  bogoPluginMeta?: MetaEntryLike[] | null;
} | null | undefined): MetaEntryLike[] | undefined {
  if (!product) return undefined;
  const base = product.metaData ?? [];
  const extra = product.bogoPluginMeta ?? [];
  const merged = [...base, ...extra].filter(Boolean) as MetaEntry[];
  const byKey = new Map<string, MetaEntry>();
  for (const entry of merged) {
    if (entry?.key) byKey.set(entry.key, entry);
  }
  return Array.from(byKey.values());
}

function isBogoEnabledRaw(value: unknown): boolean {
  if (value === true) return true;
  const s = String(value ?? "").trim().toLowerCase();
  return s === "yes" || s === "true" || s === "1" || s === "on";
}

/** Typesense / InstantSearch hits may use different field names than GraphQL `databaseId`. */
export function getDatabaseIdFromProductLike(hit: unknown): number | undefined {
  if (hit == null || typeof hit !== "object") return undefined;
  const h = hit as Record<string, unknown>;
  const candidates = [
    h.databaseId,
    h.database_id,
    h.productId,
    h.product_id,
    h.productDatabaseId,
    h.id,
  ];
  for (const c of candidates) {
    const n =
      typeof c === "number" && Number.isFinite(c)
        ? c
        : Number.parseInt(String(c ?? "").trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

export function normalizeBogoConfig(
  metaData: MetaEntryLike[] | null | undefined,
  currentProductId?: number | null
): BogoConfig {
  const enabledRaw = getMetaValue(metaData, "_wc_bogo_enabled");
  const explicitlyDisabled =
    String(enabledRaw ?? "")
      .trim()
      .toLowerCase() === "no";

  const buyQty = toPositiveIntOrDefault(
    getMetaValue(metaData, "_wc_bogo_buy_qty"),
    DEFAULT_BUY_QTY
  );
  const getQty = toPositiveIntOrDefault(
    getMetaValue(metaData, "_wc_bogo_get_qty"),
    DEFAULT_GET_QTY
  );
  const maxFreeQty = toNonNegativeIntOrDefault(
    getMetaValue(metaData, "_wc_bogo_max_free_qty"),
    DEFAULT_MAX_FREE_QTY
  );

  const multiFreeIds = normalizeProductIds(
    getMetaValue(metaData, "_wc_bogo_free_product_ids")
  );
  const legacyFreeId = normalizeProductIds(
    getMetaValue(metaData, "_wc_bogo_free_product_id")
  );

  const mergedIds = normalizeProductIds([...multiFreeIds, ...legacyFreeId]);
  const hasConfiguredFreeProducts =
    multiFreeIds.length > 0 || legacyFreeId.length > 0;

  const isBogoEnabled =
    !explicitlyDisabled &&
    (isBogoEnabledRaw(enabledRaw) || hasConfiguredFreeProducts);
  const fallbackIds =
    mergedIds.length > 0
      ? mergedIds
      : Number.isFinite(currentProductId as number) && (currentProductId as number) > 0
      ? [currentProductId as number]
      : [];

  return {
    isBogoEnabled,
    buyQty,
    getQty,
    maxFreeQty,
    freeProductIds: fallbackIds,
    label: `Buy ${buyQty} Get ${getQty} Free`,
  };
}

export function calculateBogoFreeQty(cartQty: number, bogo: Pick<BogoConfig, "buyQty" | "getQty" | "maxFreeQty">): number {
  const normalizedCartQty = Math.max(0, Math.floor(cartQty));
  const buyQty = toPositiveIntOrDefault(bogo.buyQty, DEFAULT_BUY_QTY);
  const getQty = toPositiveIntOrDefault(bogo.getQty, DEFAULT_GET_QTY);
  const maxFreeQty = toNonNegativeIntOrDefault(
    bogo.maxFreeQty,
    DEFAULT_MAX_FREE_QTY
  );

  const cycles = Math.floor(normalizedCartQty / buyQty);
  const freeQty = cycles * getQty;

  if (maxFreeQty > 0) return Math.min(freeQty, maxFreeQty);
  return freeQty;
}
