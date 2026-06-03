type AttributeLike = {
  name?: string | null;
  value?: string | null;
  val?: string | null;
};

/** Stable key for matching a variation to selected attribute values. */
export function buildVariationAttributeKey(
  attrs: AttributeLike[] | null | undefined
): string {
  return (attrs ?? [])
    .filter((a) => a.name)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    .map((a) => `${a.name}:${a.val ?? a.value ?? ""}`)
    .join("+");
}

export type VariationAttributeSelection = {
  name: string;
  val: string;
};

type VariationNode = {
  databaseId?: number | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  manageStock?: string | null;
  attributes?: {
    nodes?: Array<{ name?: string | null; value?: string | null }> | null;
  } | null;
};

export function findVariationByAttributes(
  variations: VariationNode[] | null | undefined,
  selections: VariationAttributeSelection[]
): VariationNode | undefined {
  const attrKey = buildVariationAttributeKey(
    selections.map((s) => ({ name: s.name, value: s.val }))
  );
  return (variations ?? []).find((v) => {
    const variationKey = buildVariationAttributeKey(v.attributes?.nodes ?? []);
    return attrKey === variationKey;
  });
}
