/** ACF `Single Product Fields` → `videoLink` on the WPGraphQL product type. */
export type ProductVideoSource = {
  singleProductFields?: { videoLink?: string | null } | null;
};

export function getProductVideoUrl(product: ProductVideoSource): string | undefined {
  const url = product.singleProductFields?.videoLink?.trim();
  return url || undefined;
}
