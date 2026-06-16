import {
  ProductAttribute,
  ProductVariation,
  VariationAttribute,
} from "@/graphql/types/graphql";

export function normalizeAttrName(name: string | null | undefined): string {
  return (name ?? "").replace(/^pa_/, "").toLowerCase();
}

export function variationHasOptionByValue(
  variation: ProductVariation,
  option: string,
): boolean {
  return (variation.attributes?.nodes ?? []).some(
    (node) => (node as VariationAttribute).value === option,
  );
}

export function variationHasOption(
  variation: ProductVariation,
  option: string,
  attr?: ProductAttribute,
): boolean {
  return (variation.attributes?.nodes ?? []).some((node) => {
    const n = node as VariationAttribute;
    if (n.value !== option) return false;
    if (!attr) return true;

    const attrKeys = [attr.name, attr.label].map(normalizeAttrName).filter(Boolean);
    const nodeKeys = [n.name, n.label].map(normalizeAttrName).filter(Boolean);

    return attrKeys.some((key) => nodeKeys.includes(key));
  });
}

export function findVariationByOption(
  variations: ProductVariation[],
  option: string,
  attr?: ProductAttribute,
  productAttributes?: ProductAttribute[],
): ProductVariation | undefined {
  if ((productAttributes?.length ?? 0) === 1) {
    return variations.find((v) => variationHasOptionByValue(v, option));
  }

  return variations.find((v) => variationHasOption(v, option, attr));
}

export function findMatchingVariation(
  variations: ProductVariation[],
  selection: Array<{ name: string; val: string }>,
  productAttributes: ProductAttribute[],
): ProductVariation | undefined {
  const filled = selection.filter((a) => a.val);
  if (!filled.length || !variations.length) return undefined;

  if (productAttributes.length === 1) {
    const selected =
      filled.find(
        (f) =>
          f.name === productAttributes[0].name ||
          normalizeAttrName(f.name) ===
            normalizeAttrName(productAttributes[0].name) ||
          normalizeAttrName(f.name) ===
            normalizeAttrName(productAttributes[0].label),
      )?.val ?? filled[filled.length - 1].val;

    return variations.find((v) => variationHasOptionByValue(v, selected));
  }

  const attrKey = [...filled]
    .sort((a, b) =>
      normalizeAttrName(a.name).localeCompare(normalizeAttrName(b.name)),
    )
    .map((a) => `${normalizeAttrName(a.name)}:${a.val}`)
    .join("+");

  return variations.find((v) => {
    const nodes = (v.attributes?.nodes ?? []) as VariationAttribute[];
    const variationKey = [...nodes]
      .sort((a, b) =>
        normalizeAttrName(a.name).localeCompare(normalizeAttrName(b.name)),
      )
      .map((a) => `${normalizeAttrName(a.name)}:${a.value}`)
      .join("+");
    return attrKey === variationKey;
  });
}

export function isVariationOptionSelected(
  variation: ProductVariation | null | undefined,
  option: string,
  attr: ProductAttribute,
  productAttributes: ProductAttribute[],
): boolean {
  if (!variation) return false;

  if (productAttributes.length === 1) {
    return variationHasOptionByValue(variation, option);
  }

  return variationHasOption(variation, option, attr);
}

export function variationsForOption(
  variations: ProductVariation[],
  option: string,
  attr: ProductAttribute,
  productAttributes: ProductAttribute[],
): ProductVariation[] {
  if (productAttributes.length === 1) {
    return variations.filter((v) => variationHasOptionByValue(v, option));
  }

  return variations.filter((v) => variationHasOption(v, option, attr));
}
