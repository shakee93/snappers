/**
 * Sri Lankan province names used by checkout / account address forms.
 *
 * Kept in its own module so importing the nine literals does not pull in the
 * 2,200-row city dataset from `sriLankanCities.ts` (that file initialises
 * `SRI_LANKAN_CITIES` at module scope, which bundlers treat as a side effect).
 */
export const SRI_LANKAN_PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
] as const;

export type SriLankanProvince = (typeof SRI_LANKAN_PROVINCES)[number];
