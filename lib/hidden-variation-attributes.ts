// Attribute slugs that should never surface in the sidebar variation filters
// or be sent as filter clauses to Typesense. Use this as the kill-switch for
// duplicate/legacy taxonomies that exist in WordPress but shouldn't influence
// the storefront filter UI — e.g. `pa_colour` shadows `pa_color` with the same
// terms split across both, producing wrong-colour results until the source
// taxonomy is consolidated upstream.
//
// Entries must be lowercase; use `isHiddenVariationAttribute` for lookups so
// mixed-case strays in URLs (e.g. `?variation_pa_Colour=...`) are still caught.
const HIDDEN_VARIATION_ATTRIBUTES = new Set<string>(["pa_colour"]);

export const isHiddenVariationAttribute = (slug: string): boolean =>
  HIDDEN_VARIATION_ATTRIBUTES.has(slug.toLowerCase());
