type ImageLike = { sourceUrl?: string | null } | null | undefined;

type VariationImageLike = {
  image?: ImageLike;
  stockStatus?: string | null;
} | null;

type VariationsLike = {
  edges?: Array<{ node?: VariationImageLike } | null> | null;
  nodes?: VariationImageLike[] | null;
} | null;

export const normalizeProductImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const normalized = url.replace("http://", "https://");
  return normalized.length > 0 ? normalized : null;
};

export const collectVariationNodes = (
  variations?: VariationsLike
): NonNullable<VariationImageLike>[] => {
  const fromEdges =
    variations?.edges?.map((edge) => edge?.node).filter(Boolean) ?? [];
  const fromNodes = variations?.nodes?.filter(Boolean) ?? [];
  return [...fromEdges, ...fromNodes] as NonNullable<VariationImageLike>[];
};

/** Parent image first; otherwise the first in-stock variation image, then any variation. */
export const resolveProductImageUrl = (
  image?: ImageLike,
  variations?: VariationsLike
): string | null => {
  const parent = normalizeProductImageUrl(image?.sourceUrl);
  if (parent) return parent;

  const variationNodes = collectVariationNodes(variations);
  const inStock = variationNodes.filter((v) => v.stockStatus === "IN_STOCK");
  const pools = inStock.length > 0 ? [inStock, variationNodes] : [variationNodes];

  for (const pool of pools) {
    for (const variation of pool) {
      const url = normalizeProductImageUrl(variation.image?.sourceUrl);
      if (url) return url;
    }
  }

  return null;
};

/** All unique variation image URLs (edges + nodes), for multi-image carousels. */
export const collectVariationImageUrls = (
  variations?: VariationsLike
): string[] => {
  const seen = new Set<string>();

  return collectVariationNodes(variations).flatMap((variation) => {
    const url = normalizeProductImageUrl(variation.image?.sourceUrl);
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [url];
  });
};
