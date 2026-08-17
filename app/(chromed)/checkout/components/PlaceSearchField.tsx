"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Loader, Search, X } from "lucide-react";
import type { PinCoordinates } from "./PinLocationMap";

interface PlaceSearchFieldProps {
    id: string;
    /**
     * Current map viewport, read lazily so panning does not re-render this
     * field. Results are biased toward it — searching "temple road" should
     * offer the one the customer is looking at first.
     */
    getLocationBias: () => google.maps.LatLngBounds | null;
    /** Fired when a suggestion is picked and its coordinates have loaded. */
    onSelect: (coordinates: PinCoordinates) => void;
}

/** Short enough to feel like type-ahead, long enough not to bill every letter. */
const SEARCH_DEBOUNCE_MS = 250;
/** Below this Google returns mostly noise, and every call is billable. */
const MIN_QUERY_LENGTH = 3;

interface Suggestion {
    id: string;
    mainText: string;
    secondaryText: string;
    prediction: google.maps.places.PlacePrediction;
}

const PlaceSearchField = ({ id, getLocationBias, onSelect }: PlaceSearchFieldProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    /**
     * Groups keystrokes into one billable Autocomplete session, which ends at
     * the `fetchFields` call below. A fresh token starts the next session.
     */
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(
        null,
    );
    /** Discards responses that arrive after a newer query has been typed. */
    const generationRef = useRef(0);

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    // The deferred list can shrink under a stale index, so clamp on render
    // rather than let aria-activedescendant point at a missing option.
    const activeOptionIndex = activeIndex < suggestions.length ? activeIndex : -1;

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || activeIndex < 0) return;

        listRef.current
            ?.querySelector<HTMLElement>(`[data-place-option-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [activeIndex, isOpen]);

    // Invalidate any in-flight response on unmount.
    useEffect(() => () => {
        generationRef.current += 1;
    }, []);

    const runSearch = useCallback(
        async (input: string) => {
            const generation = ++generationRef.current;
            const isCurrent = () => generationRef.current === generation;

            if (!sessionTokenRef.current) {
                sessionTokenRef.current =
                    new google.maps.places.AutocompleteSessionToken();
            }

            try {
                const { suggestions: results } =
                    await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
                        {
                            input,
                            sessionToken: sessionTokenRef.current,
                            includedRegionCodes: ["lk"],
                            locationBias: getLocationBias() ?? undefined,
                        },
                    );
                if (!isCurrent()) return;

                setSuggestions(
                    results.flatMap((result) => {
                        const prediction = result.placePrediction;
                        if (!prediction) return [];
                        return [
                            {
                                id: prediction.placeId,
                                mainText:
                                    prediction.mainText?.text ?? prediction.text.text,
                                secondaryText: prediction.secondaryText?.text ?? "",
                                prediction,
                            },
                        ];
                    }),
                );
                setIsOpen(true);
            } catch (error) {
                if (!isCurrent()) return;
                // Searching is a convenience over dragging the pin, so a failed
                // lookup empties the list rather than interrupting the customer.
                console.error("Place autocomplete failed:", error);
                setSuggestions([]);
            } finally {
                if (isCurrent()) setIsSearching(false);
            }
        },
        [getLocationBias],
    );

    const debouncedSearch = useDebouncedCallback(runSearch, SEARCH_DEBOUNCE_MS);

    const handleChange = (value: string) => {
        setQuery(value);
        setActiveIndex(-1);

        const trimmed = value.trim();
        if (trimmed.length < MIN_QUERY_LENGTH) {
            debouncedSearch.cancel();
            // Supersede anything in flight so a slower earlier response cannot
            // repopulate the list the customer has just cleared.
            generationRef.current += 1;
            setSuggestions([]);
            setIsSearching(false);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);
        setIsOpen(true);
        debouncedSearch(trimmed);
    };

    const handleSelect = useCallback(
        async (suggestion: Suggestion) => {
            debouncedSearch.cancel();
            setQuery(suggestion.mainText);
            setIsOpen(false);
            setActiveIndex(-1);
            setIsSearching(true);

            const generation = ++generationRef.current;

            try {
                const place = suggestion.prediction.toPlace();
                await place.fetchFields({ fields: ["location"] });
                if (generationRef.current !== generation) return;

                const location = place.location;
                if (location) {
                    onSelect({ lat: location.lat(), lng: location.lng() });
                }
            } catch (error) {
                console.error("Failed to load the selected place:", error);
            } finally {
                // The session ended with fetchFields either way — the next
                // search must start a new one or it is billed per request.
                sessionTokenRef.current = null;
                if (generationRef.current === generation) setIsSearching(false);
            }
        },
        [debouncedSearch, onSelect],
    );

    const handleClear = () => {
        debouncedSearch.cancel();
        generationRef.current += 1;
        setQuery("");
        setSuggestions([]);
        setIsSearching(false);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const activeOptionId =
        isOpen && activeOptionIndex >= 0
            ? `${id}-place-option-${activeOptionIndex}`
            : undefined;

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={2}
                />
                <input
                    id={id}
                    type="text"
                    className="h-11 w-full rounded-xl border-0 bg-white pl-9 pr-10 text-sm text-slate-900 shadow-lg ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-header-green dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                    placeholder="Search for a place or address"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length) setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (!suggestions.length) return;
                            setIsOpen(true);
                            setActiveIndex((prev) =>
                                prev < suggestions.length - 1 ? prev + 1 : 0,
                            );
                            return;
                        }

                        if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (!suggestions.length) return;
                            setIsOpen(true);
                            setActiveIndex((prev) =>
                                prev > 0 ? prev - 1 : suggestions.length - 1,
                            );
                            return;
                        }

                        if (e.key === "Enter") {
                            // Never submit the checkout form from this field.
                            e.preventDefault();
                            if (isOpen && activeOptionIndex >= 0) {
                                void handleSelect(suggestions[activeOptionIndex]);
                            }
                            return;
                        }

                        if (e.key === "Escape") {
                            setIsOpen(false);
                            setActiveIndex(-1);
                        }
                    }}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-place-listbox`}
                    aria-autocomplete="list"
                    aria-activedescendant={activeOptionId}
                    aria-label="Search for a delivery address"
                />
                {isSearching ? (
                    <Loader
                        className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
                        strokeWidth={2}
                    />
                ) : query ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                ) : null}
            </div>

            {isOpen && (suggestions.length > 0 || !isSearching) ? (
                <ul
                    ref={listRef}
                    id={`${id}-place-listbox`}
                    role="listbox"
                    // max-h is sized to stay inside the map's rounded, clipped
                    // frame on the shorter mobile height (h-72).
                    className="absolute z-30 mt-2 max-h-48 w-full overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200 [scrollbar-width:thin] dark:bg-slate-800 dark:ring-slate-700"
                >
                    {suggestions.length ? (
                        suggestions.map((suggestion, index) => (
                            <li key={suggestion.id} role="presentation">
                                <button
                                    type="button"
                                    id={`${id}-place-option-${index}`}
                                    data-place-option-index={index}
                                    role="option"
                                    aria-selected={index === activeOptionIndex}
                                    tabIndex={-1}
                                    className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 ${
                                        index === activeOptionIndex
                                            ? "bg-slate-100 dark:bg-slate-700"
                                            : ""
                                    }`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => void handleSelect(suggestion)}
                                >
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {suggestion.mainText}
                                    </span>
                                    {suggestion.secondaryText ? (
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {suggestion.secondaryText}
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li
                            className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400"
                            role="presentation"
                        >
                            No matching places. Try a nearby landmark, or drag the pin.
                        </li>
                    )}
                </ul>
            ) : null}
        </div>
    );
};

export default PlaceSearchField;
