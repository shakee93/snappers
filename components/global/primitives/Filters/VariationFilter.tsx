import React, { useCallback, useMemo, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { useStore } from "@/store/store";
import { useHits } from "react-instantsearch";
import { ChevronDown } from "lucide-react";
import { Transition } from "@headlessui/react";

interface VariationFilterProps {
    attribute: string;
    label: string;
}

type FacetItem = { value: string; count: number };

const VariationFilter = ({ attribute, label }: VariationFilterProps) => {
    const { syncVariations, sidebar: { variations }, getTermLabel } = useStore();
    const [showAll, setShowAll] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { results } = useHits();

    // Read facet items from the search response directly. We deliberately
    // avoid useRefinementList here: registering a widget after the first
    // search returns triggers a second multi_search round-trip (visible flicker).
    // The facet_by config on the typesense adapter already returns
    // variation_facets.* on every search, so we have what we need.
    const facets: FacetItem[] = useMemo(() => {
        const raw = (results as any)?._rawResults?.[0]?.facets?.[`variation_facets.${attribute}`];
        if (!raw || typeof raw !== 'object') return [];
        return Object.entries(raw).map(([value, count]) => ({ value, count: Number(count) || 0 }));
    }, [results, attribute]);

    const currentValues = variations[attribute] || [];

    const handleChange = useCallback((checked: boolean, value: string) => {
        if (value === "all" && checked) {
            syncVariations(attribute, []);
            return;
        }

        const newValues = checked
            ? [...currentValues, value]
            : currentValues.filter((v) => v !== value);

        syncVariations(attribute, newValues);
    }, [currentValues, attribute, syncVariations]);

    const sortedFacets = useMemo(() => {
        return [...facets].sort((a, b) => b.count - a.count);
    }, [facets]);

    const totalCount = useMemo(() => {
        return facets.reduce((acc, f) => acc + (f.count || 0), 0);
    }, [facets]);

    // Create a combined list of facets and selected values that aren't in facets
    const displayItems = useMemo(() => {
        const facetValues = new Set(facets.map(f => f.value));
        const selectedNotInFacets = currentValues
            .filter(v => !facetValues.has(v))
            .map(value => ({ value, count: 0 }));

        return [...sortedFacets, ...selectedNotInFacets];
    }, [sortedFacets, currentValues, facets]);

    // Don't render if no facets available AND no selected values
    if (facets.length === 0 && currentValues.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden relative w-full z-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <div className="relative flex flex-col px-4 py-3 w-full space-y-3">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="font-medium flex gap-2 items-center justify-between w-full text-left hover:opacity-80 transition-opacity text-sm"
                >
                    <span>{label}</span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>

                <Transition
                    show={!isCollapsed}
                    enter="transition-all duration-300 ease-out"
                    enterFrom="opacity-0 max-h-0"
                    enterTo="opacity-100 max-h-[1000px]"
                    leave="transition-all duration-300 ease-in"
                    leaveFrom="opacity-100 max-h-[1000px]"
                    leaveTo="opacity-0 max-h-0"
                >
                    <div className="space-y-3">
                        <Checkbox
                            name={`All ${label}`}
                            label={`All ${label} (${totalCount})`}
                            defaultChecked={currentValues.length === 0}
                            onChange={(checked) => handleChange(checked, "all")}
                        />

                        <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />

                        <div className="relative">
                            <div className='grid grid-cols-1 gap-2'>
                                {(showAll ? displayItems : displayItems.slice(0, 10)).map((item) => {
                                    // Get the proper term label from the attribute mapping service
                                    const termLabel = getTermLabel(attribute, item.value);
                                    return (
                                        <div key={item.value} className="">
                                            <Checkbox
                                                name={item.value}
                                                label={`${termLabel} (${item.count})`}
                                                defaultChecked={currentValues.includes(item.value)}
                                                onChange={(checked) => handleChange(checked, item.value)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {displayItems.length > 10 && !showAll && (
                                <>
                                    {/* Gradient overlay */}
                                    <div className="absolute bottom-8 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none z-10" />

                                    {/* Show More button */}
                                    <div className="mt-2 text-center relative z-15">
                                        <button
                                            onClick={() => setShowAll(true)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                        >
                                            Show More ({displayItems.length - 10} more)
                                        </button>
                                    </div>
                                </>
                            )}

                            {displayItems.length > 10 && showAll && (
                                <div className="mt-2 text-center">
                                    <button
                                        onClick={() => setShowAll(false)}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                    >
                                        Show Less
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    );
};

export default VariationFilter;
