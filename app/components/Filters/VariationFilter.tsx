import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { useStore } from "@/store/store";
import { useRefinementList } from "react-instantsearch";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Transition } from "@headlessui/react";

interface VariationFilterProps {
    attribute: string;
    label: string;
}

const VariationFilter = ({ attribute, label }: VariationFilterProps) => {
    const { syncVariations, sidebar: { variations }, getTermLabel } = useStore();
    const [firstFacets, setFirstFacets] = useState<any[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const searchParams = useSearchParams();

    const { items: facets } = useRefinementList({
        attribute: `variation_facets.${attribute}`,
        limit: 50,
    });

    const currentValues = variations[attribute] || [];

    useEffect(() => {
        // Read from URL on mount
        const urlValues = searchParams.get(`variation_${attribute}`);
        if (urlValues) {
            const values = urlValues.split(',');
            syncVariations(attribute, values);
        }
    }, [attribute]);

    useEffect(() => {
        // Update URL when variations change
        const url = new URL(window.location.href);
        if (currentValues.length > 0) {
            url.searchParams.set(`variation_${attribute}`, currentValues.join(','));
        } else {
            url.searchParams.delete(`variation_${attribute}`);
        }
        window.history.replaceState({}, '', url.toString());
    }, [currentValues, attribute]);

    useEffect(() => {
        if (firstFacets.length === 0) {
            setFirstFacets(facets);
        }
    }, [facets]);

    const handleChange = useCallback((checked: boolean, value: string) => {
        if (value === "all" && checked) {
            syncVariations(attribute, []);
            return;
        }

        checked
            ? syncVariations(attribute, [...currentValues, value])
            : syncVariations(attribute, currentValues.filter((v) => v !== value));
    }, [currentValues, attribute]);

    const sortedFacets = useMemo(() => {
        return [...facets].sort((a, b) => b.count - a.count);
    }, [facets]);

    const totalCount = useMemo(() => {
        return facets.reduce((acc, f) => acc + (f.count || 0), 0);
    }, [facets]);

    // Don't render if no facets available
    if (facets.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden relative w-full z-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <div className="relative flex flex-col px-4 py-4 w-full space-y-5">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="font-medium flex gap-2 items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
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
                    <div className="space-y-5">
                        <Checkbox
                            name={`All ${label}`}
                            label={`All ${label} (${totalCount})`}
                            defaultChecked={currentValues.length === 0}
                            onChange={(checked) => handleChange(checked, "all")}
                        />

                        <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />

                        <div className="relative">
                            <div className='grid grid-cols-1 gap-2'>
                                {(showAll ? sortedFacets : sortedFacets.slice(0, 10)).map((item) => {
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

                            {sortedFacets.length > 10 && !showAll && (
                                <>
                                    {/* Gradient overlay */}
                                    <div className="absolute bottom-8 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none z-10" />

                                    {/* Show More button */}
                                    <div className="mt-2 text-center relative z-15">
                                        <button
                                            onClick={() => setShowAll(true)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                        >
                                            Show More ({sortedFacets.length - 10} more)
                                        </button>
                                    </div>
                                </>
                            )}

                            {sortedFacets.length > 10 && showAll && (
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
