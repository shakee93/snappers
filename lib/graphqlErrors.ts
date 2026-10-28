/** WPGraphQL returns this when `product(id, idType: SLUG)` misses — expected during slug resolution. */
export function isWpProductSlugNotFoundError(
  errors: ReadonlyArray<{ message?: string | null }> | undefined,
): boolean {
  if (!errors?.length) return false;
  return errors.every((entry) =>
    /No product ID was found corresponding to the slug:/i.test(
      entry.message ?? "",
    ),
  );
}
