/**
 * Loads the Google Maps JavaScript API on demand, once per page.
 *
 * The checkout bundle must not pay for this: nothing here runs until the
 * customer opens the "Pin location" tab. Billing and shipping each mount
 * their own map, so the promise is memoised at module scope — the second
 * map reuses the first one's script instead of injecting a duplicate.
 */

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/**
 * Required by `AdvancedMarkerElement` (the draggable pin). `DEMO_MAP_ID` is
 * Google's development placeholder — it works, but it is rate-limited and
 * ignores any map styling. Create a real Map ID under Google Maps Platform →
 * Map Management and set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` before production.
 */
export const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

/** Colombo — the fallback centre when we have neither an address nor a GPS fix. */
export const DEFAULT_MAP_CENTER = { lat: 6.9271, lng: 79.8612 } as const;
export const DEFAULT_MAP_ZOOM = 12;
/** Zoom used once we actually know where the customer is. */
export const LOCATED_MAP_ZOOM = 17;

const CALLBACK_NAME = "__gqGoogleMapsReady";

type MapsNamespace = typeof google.maps;

declare global {
  interface Window {
    [CALLBACK_NAME]?: () => void;
  }
}

let loaderPromise: Promise<MapsNamespace> | null = null;

export function loadGoogleMaps(): Promise<MapsNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Maps can only be loaded in the browser."),
    );
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."),
    );
  }

  loaderPromise = new Promise<MapsNamespace>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      callback: CALLBACK_NAME,
      loading: "async",
      // `marker` supplies AdvancedMarkerElement, the draggable pin.
      libraries: "marker",
      // Bias geocoding to Sri Lanka so ambiguous place names resolve locally.
      region: "LK",
      language: "en",
    });

    window[CALLBACK_NAME] = () => {
      delete window[CALLBACK_NAME];
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        // Retryable: a rejected promise must not be cached as the loaded state.
        loaderPromise = null;
        reject(new Error("Google Maps loaded without a maps namespace."));
      }
    };

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      delete window[CALLBACK_NAME];
      script.remove();
      loaderPromise = null;
      reject(new Error("Failed to load the Google Maps script."));
    };

    document.head.appendChild(script);
  });

  return loaderPromise;
}
