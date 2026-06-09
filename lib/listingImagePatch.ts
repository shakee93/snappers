import { resolveProductImageUrl } from "@/lib/productImage";

type ListingImageNode = {
  databaseId?: number | null;
  image?: { sourceUrl?: string | null } | null;
  variations?: {
    nodes?: Array<{
      image?: { sourceUrl?: string | null } | null;
      stockStatus?: string | null;
    } | null> | null;
  } | null;
};

export type ListingImagePatch = Pick<
  ListingImageNode,
  "image" | "variations"
>;

/** Products whose Typesense hit has no renderable image. */
export function collectProductIdsNeedingImageBackfill(
  hits: Array<{
    databaseId?: number | null;
    image?: { sourceUrl?: string | null } | null;
    variations?: ListingImagePatch["variations"];
  }>
): number[] {
  const ids = new Set<number>();

  for (const hit of hits) {
    const id =
      typeof hit.databaseId === "number" ? hit.databaseId : null;
    if (id == null) continue;
    if (resolveProductImageUrl(hit.image, hit.variations)) continue;
    ids.add(id);
  }

  return Array.from(ids);
}

export function buildListingImagePatchByProductId(
  nodes: Array<ListingImageNode | null | undefined> | null | undefined
): Record<number, ListingImagePatch> {
  const map: Record<number, ListingImagePatch> = {};

  for (const node of nodes ?? []) {
    if (node?.databaseId == null) continue;
    map[node.databaseId] = {
      image: node.image,
      variations: node.variations,
    };
  }

  return map;
}
