/**
 * Turns a Google reverse-geocode result into the checkout address fields.
 *
 * The courier quotes city and postcode *as a pair*, so a Google locality is
 * only trusted once it has been snapped onto `SRI_LANKAN_CITIES` — the same
 * dataset the city combobox commits from. When a pin lands on a known city we
 * take that row's postcode and province and ignore Google's, which is what
 * keeps a pinned destination priced identically to a picked one.
 */

import { SRI_LANKAN_CITIES, type SriLankanCity } from "@/data/sriLankanCities";
import {
  SRI_LANKAN_PROVINCES,
  type SriLankanProvince,
} from "@/data/sriLankanProvinces";

export interface ResolvedPinAddress {
  /** Street line, best effort — empty when Google has no street for the pin. */
  address: string;
  city: string;
  state: SriLankanProvince | "";
  /** Empty when neither the snapped city nor Google supplied one. */
  postal: string;
  /** Google's own one-line rendering, shown as the preview caption. */
  formatted: string;
}

let cityIndex: Map<string, SriLankanCity> | null = null;

/** Built on first pin, not at module scope — the map tab may never open. */
const getCityIndex = (): Map<string, SriLankanCity> => {
  if (!cityIndex) {
    cityIndex = new Map<string, SriLankanCity>();
    for (const city of SRI_LANKAN_CITIES) {
      const key = city.name.trim().toLowerCase();
      // First row wins: the dataset lists its canonical spelling first.
      if (!cityIndex.has(key)) {
        cityIndex.set(key, city);
      }
    }
  }
  return cityIndex;
};

const componentOf = (
  components: google.maps.GeocoderAddressComponent[],
  type: string,
): string =>
  components.find((component) => component.types.includes(type))?.long_name ??
  "";

const normaliseProvince = (raw: string): SriLankanProvince | "" => {
  const cleaned = raw.replace(/\s+province$/i, "").trim().toLowerCase();
  return (
    SRI_LANKAN_PROVINCES.find((province) => province.toLowerCase() === cleaned) ??
    ""
  );
};

/**
 * Google returns several nested place names for one pin — in Sri Lanka the
 * `locality` is often the district capital ("Colombo") while the row our rate
 * table knows is the suburb ("Wellampitiya"). Walk from most to least
 * specific and take the first name that exists in the rate dataset; fall back
 * to the most specific non-empty name when none of them do.
 */
const resolveCity = (
  components: google.maps.GeocoderAddressComponent[],
): { city: string; match: SriLankanCity | null } => {
  const candidates = [
    componentOf(components, "sublocality_level_1"),
    componentOf(components, "sublocality"),
    componentOf(components, "neighborhood"),
    componentOf(components, "locality"),
    componentOf(components, "postal_town"),
    componentOf(components, "administrative_area_level_3"),
    componentOf(components, "administrative_area_level_2"),
  ].filter(Boolean);

  const index = getCityIndex();
  for (const candidate of candidates) {
    const match = index.get(candidate.trim().toLowerCase());
    if (match) {
      return { city: match.name, match };
    }
  }

  return { city: candidates[0] ?? "", match: null };
};

const resolveStreetLine = (
  result: google.maps.GeocoderResult,
  city: string,
): string => {
  const components = result.address_components;
  const route = componentOf(components, "route");
  if (route) {
    const streetNumber = componentOf(components, "street_number");
    return [streetNumber, route].filter(Boolean).join(" ");
  }

  const premise =
    componentOf(components, "premise") ||
    componentOf(components, "point_of_interest") ||
    componentOf(components, "establishment");
  if (premise) {
    return premise;
  }

  // Last resort: the leading segment of the formatted address, unless that is
  // just the city repeated back (which would leave the street line useless).
  const leading = result.formatted_address.split(",")[0]?.trim() ?? "";
  return leading.toLowerCase() === city.trim().toLowerCase() ? "" : leading;
};

export const resolvePinAddress = (
  result: google.maps.GeocoderResult,
): ResolvedPinAddress => {
  const components = result.address_components;
  const { city, match } = resolveCity(components);

  // A snapped city's postcode and province outrank Google's: they are the
  // pair the shipping zone is configured against. A known city with no
  // postcode on file falls through to Google's, then to empty — which the
  // postal field's own validation then forces the customer to fill.
  const postal = match?.postcode ?? componentOf(components, "postal_code");
  const state =
    match?.province ??
    normaliseProvince(componentOf(components, "administrative_area_level_1"));

  return {
    address: resolveStreetLine(result, city),
    city,
    state,
    postal,
    formatted: result.formatted_address,
  };
};

/**
 * Picks the most useful of Google's candidate results. Google orders them
 * most- to least-specific, but the first entry for a rural pin is often a
 * plus-code with no street data — prefer the first result that carries a
 * route, and fall back to Google's own ordering.
 */
export const pickBestGeocodeResult = (
  results: google.maps.GeocoderResult[],
): google.maps.GeocoderResult | null => {
  if (!results.length) return null;
  return (
    results.find((result) =>
      result.address_components.some((component) =>
        component.types.includes("route"),
      ),
    ) ?? results[0]
  );
};
