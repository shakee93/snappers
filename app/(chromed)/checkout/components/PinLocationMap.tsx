"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Loader, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ButtonBrand from "shared/Button/ButtonBrand";
import {
    DEFAULT_MAP_CENTER,
    DEFAULT_MAP_ZOOM,
    GOOGLE_MAPS_MAP_ID,
    LOCATED_MAP_ZOOM,
    loadGoogleMaps,
} from "@/lib/googleMaps";
import {
    pickBestGeocodeResult,
    resolvePinAddress,
    type ResolvedPinAddress,
} from "@/lib/checkoutGeocode";
import PlaceSearchField from "./PlaceSearchField";

export interface PinCoordinates {
    lat: number;
    lng: number;
}

interface PinLocationMapProps {
    /** Namespaces element ids, so billing and shipping maps never collide. */
    idPrefix: string;
    /**
     * The address as typed on the sibling tab, used once to place the pin.
     * Empty when nothing usable has been entered yet.
     */
    addressQuery: string;
    /** Pin already applied to this address block, so re-opening returns to it. */
    pin: PinCoordinates | null;
    /** Fired only on "Use this location" - never while the pin is being moved. */
    onApply: (resolved: ResolvedPinAddress, coordinates: PinCoordinates) => void;
}

/** Long enough that a dragged pin doesn't bill a geocode per frame. */
const REVERSE_GEOCODE_DEBOUNCE_MS = 500;
/**
 * Geolocation runs only when the customer presses "Use my current location".
 * Opening the tab must not raise a browser permission prompt on a payment
 * page - an unprompted request there reads as the site grabbing at something,
 * and a denial is sticky. Without a pin or a typed address the map simply
 * opens on the default centre and waits to be searched or dragged.
 */
const REQUESTED_GEOLOCATION = { enableHighAccuracy: true, timeout: 10000 };
/** ~10cm - below this the pin has not meaningfully moved. */
const COORDINATE_EPSILON = 1e-6;

/**
 * Brand pin: dark-green teardrop with a lime centre, matching the checkout
 * CTA. Colours come straight from the theme tokens rather than Tailwind
 * classes because this element is built imperatively for the marker content.
 */
const PIN_SVG = `
<svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))">
  <path d="M17 40.5C17 40.5 31.5 25.9 31.5 16.5C31.5 8.49 25.0 2 17 2C8.99 2 2.5 8.49 2.5 16.5C2.5 25.9 17 40.5 17 40.5Z" fill="rgb(var(--c-header-green))" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="17" cy="16.2" r="5.6" fill="rgb(var(--c-header-action))"/>
</svg>`;

const createPinElement = (): HTMLElement => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = PIN_SVG.trim();
    // Grabbable affordance so the pin reads as draggable before it is touched.
    wrapper.style.cursor = "grab";
    return wrapper;
};

const geolocate = (
    options: PositionOptions,
): Promise<PinCoordinates | null> =>
    new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }),
            // Callers decide what a refused or failed fix means: on open it is
            // silent (the pin just falls back), on request it is reported.
            () => resolve(null),
            options,
        );
    });

const isSameCoordinate = (a: PinCoordinates | null, b: PinCoordinates) =>
    !!a &&
    Math.abs(a.lat - b.lat) < COORDINATE_EPSILON &&
    Math.abs(a.lng - b.lng) < COORDINATE_EPSILON;

const PinLocationMap = ({
    idPrefix,
    addressQuery,
    pin,
    onApply,
}: PinLocationMapProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastGeocodedRef = useRef<PinCoordinates | null>(null);
    /** Where the pin currently sits - the value "Use this location" applies. */
    const positionRef = useRef<PinCoordinates | null>(pin);
    /** Invalidates in-flight geocodes when the pin moves again, or unmounts. */
    const generationRef = useRef(0);

    // Read inside the mount effect without making it a dependency: these are
    // the *initial* placement inputs, and re-placing the pin mid-session would
    // throw away a position the customer had already chosen.
    const addressQueryRef = useRef(addressQuery);
    const pinRef = useRef(pin);

    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [resolved, setResolved] = useState<ResolvedPinAddress | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const runReverseGeocode = useCallback(async (position: PinCoordinates) => {
        const geocoder = geocoderRef.current;
        if (!geocoder) return;

        const generation = ++generationRef.current;
        const isCurrent = () => generationRef.current === generation;

        setIsResolving(true);
        try {
            const { results } = await geocoder.geocode({
                location: position,
                region: "LK",
            });
            if (!isCurrent()) return;

            const best = pickBestGeocodeResult(results);
            setResolved(best ? resolvePinAddress(best) : null);
            lastGeocodedRef.current = position;
        } catch {
            if (!isCurrent()) return;
            // A dropped lookup blanks the preview rather than describing the
            // pin's previous position - the customer can nudge it to retry.
            setResolved(null);
            // Forget the position too, or dragging back to a spot whose lookup
            // failed would dedupe against it and leave the preview empty for
            // good, with no way back short of moving somewhere else first.
            lastGeocodedRef.current = null;
        } finally {
            if (isCurrent()) setIsResolving(false);
        }
    }, []);

    /** Moves the pin, and schedules the lookup that describes where it landed. */
    const movePin = useCallback(
        (next: PinCoordinates) => {
            if (markerRef.current) {
                markerRef.current.position = next;
            }
            positionRef.current = next;

            if (isSameCoordinate(lastGeocodedRef.current, next)) return;

            // Supersede any in-flight lookup immediately: the preview under the
            // map must never describe a position the pin has already left.
            generationRef.current += 1;
            setIsResolving(true);

            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                debounceRef.current = null;
                void runReverseGeocode(next);
            }, REVERSE_GEOCODE_DEBOUNCE_MS);
        },
        [runReverseGeocode],
    );

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            let maps: typeof google.maps;
            try {
                maps = await loadGoogleMaps();
            } catch (error) {
                if (cancelled) return;
                console.error("Failed to load Google Maps for checkout:", error);
                setStatus("error");
                setErrorMessage(
                    "The map could not be loaded. Please enter your address on the Address tab.",
                );
                return;
            }
            if (cancelled || !containerRef.current) return;

            geocoderRef.current = new maps.Geocoder();

            // Placement order: an existing pin, then the typed address, then
            // the default centre. No GPS here - see REQUESTED_GEOLOCATION.
            let position: PinCoordinates = DEFAULT_MAP_CENTER;
            let zoom = DEFAULT_MAP_ZOOM;

            if (pinRef.current) {
                position = pinRef.current;
                zoom = LOCATED_MAP_ZOOM;
            } else {
                const query = addressQueryRef.current.trim();
                if (query) {
                    try {
                        const { results } = await geocoderRef.current.geocode({
                            address: query,
                            region: "LK",
                        });
                        const best = pickBestGeocodeResult(results);
                        if (best) {
                            position = best.geometry.location.toJSON();
                            zoom = LOCATED_MAP_ZOOM;
                        }
                    } catch {
                        // Unresolvable typed address - open on the default centre
                        // and let the customer search or drag from there.
                    }
                }
            }
            if (cancelled || !containerRef.current) return;

            const map = new maps.Map(containerRef.current, {
                center: position,
                zoom,
                mapId: GOOGLE_MAPS_MAP_ID,
                // The customer opened a map tab on purpose, so one finger pans
                // it rather than scrolling the page past it.
                gestureHandling: "greedy",
                disableDefaultUI: true,
                zoomControl: true,
                clickableIcons: false,
            });

            const marker = new maps.marker.AdvancedMarkerElement({
                map,
                position,
                gmpDraggable: true,
                content: createPinElement(),
                title: "Delivery location - drag to move",
            });

            mapRef.current = map;
            markerRef.current = marker;
            positionRef.current = position;
            // Claim the opening position so the first lookup below is not
            // repeated by anything that reads `lastGeocodedRef` afterwards.
            lastGeocodedRef.current = position;
            setStatus("ready");

            marker.addListener("dragstart", () => setIsMoving(true));
            marker.addListener("dragend", () => {
                setIsMoving(false);
                const next = marker.position;
                if (!next) return;
                movePin({
                    lat: typeof next.lat === "number" ? next.lat : next.lat(),
                    lng: typeof next.lng === "number" ? next.lng : next.lng(),
                });
            });

            // Tapping the map is the fast path on a phone, where dragging a pin
            // across the screen is far more work than pointing at the target.
            map.addListener("click", (event: google.maps.MapMouseEvent) => {
                if (!event.latLng) return;
                movePin(event.latLng.toJSON());
            });

            void runReverseGeocode(position);
        };

        void init();

        return () => {
            cancelled = true;
            // Stop any pending or in-flight lookup from writing after unmount.
            generationRef.current += 1;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (markerRef.current) {
                google.maps.event.clearInstanceListeners(markerRef.current);
                markerRef.current.map = null;
                markerRef.current = null;
            }
            if (mapRef.current) {
                google.maps.event.clearInstanceListeners(mapRef.current);
                mapRef.current = null;
            }
        };
    }, [movePin, runReverseGeocode]);

    const handleUseCurrentLocation = useCallback(async () => {
        setIsLocating(true);
        const fix = await geolocate(REQUESTED_GEOLOCATION);
        setIsLocating(false);
        if (!fix || !mapRef.current) {
            // Silence here would read as a dead button - the usual cause is a
            // denied permission, which only the customer can undo.
            toast.error(
                "We couldn't get your location. Check location permissions, or drag the pin instead.",
            );
            return;
        }
        mapRef.current.panTo(fix);
        mapRef.current.setZoom(LOCATED_MAP_ZOOM);
        movePin(fix);
    }, [movePin]);

    /** Stable across map moves, so panning never re-renders the search field. */
    const getLocationBias = useCallback(
        () => mapRef.current?.getBounds() ?? null,
        [],
    );

    const handleSearchSelect = useCallback(
        (coordinates: PinCoordinates) => {
            mapRef.current?.panTo(coordinates);
            mapRef.current?.setZoom(LOCATED_MAP_ZOOM);
            movePin(coordinates);
        },
        [movePin],
    );

    const handleApply = useCallback(() => {
        if (!resolved || !positionRef.current) return;
        onApply(resolved, positionRef.current);
    }, [onApply, resolved]);

    if (status === "error") {
        return (
            <div className="flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                <p>{errorMessage}</p>
            </div>
        );
    }

    const canApply = !!resolved && !isResolving && !isMoving;

    return (
        <div className="space-y-3">
            <div className="relative h-72 w-full overflow-hidden rounded-xl border-2 border-slate-300 dark:border-slate-600 sm:h-80">
                <div ref={containerRef} className="h-full w-full" />

                {status === "loading" && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Loader className="h-4 w-4 animate-spin" strokeWidth={2} />
                        Loading map…
                    </div>
                )}

                {status === "ready" && (
                    <div className="absolute inset-x-3 top-3">
                        <PlaceSearchField
                            id={`${idPrefix}-place-search`}
                            getLocationBias={getLocationBias}
                            onSelect={handleSearchSelect}
                        />
                    </div>
                )}

                {status === "ready" && (
                    <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
                    >
                        {isLocating ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                        ) : (
                            <Crosshair className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                        Use my current location
                    </button>
                )}
            </div>

            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                {isResolving || isMoving ? (
                    <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Loader className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                        Finding the address at this pin…
                    </p>
                ) : resolved ? (
                    <>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {resolved.formatted}
                        </p>
                        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex gap-1">
                                <dt className="font-medium">City:</dt>
                                <dd>{resolved.city || "-"}</dd>
                            </div>
                            <div className="flex gap-1">
                                <dt className="font-medium">Province:</dt>
                                <dd>{resolved.state || "-"}</dd>
                            </div>
                            <div className="flex gap-1">
                                <dt className="font-medium">Postal code:</dt>
                                <dd>{resolved.postal || "-"}</dd>
                            </div>
                        </dl>
                    </>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        No address found at this pin. Move it slightly, or enter your
                        address on the Address tab.
                    </p>
                )}
            </div>

            <ButtonBrand
                type="button"
                className="w-full sm:w-auto"
                disabled={!canApply}
                onClick={handleApply}
            >
                Use this location
            </ButtonBrand>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag the pin onto your door - or tap anywhere on the map to move it -
                then apply it. Your delivery cost updates once, when you apply.
            </p>
        </div>
    );
};

export default PinLocationMap;
