import React, { useEffect, useState } from "react";
import { useHits } from "react-instantsearch";
import VariationFilter from "./VariationFilter";
import { useStore } from "@/store/store";
import { isHiddenVariationAttribute } from "@/lib/hidden-variation-attributes";

const DynamicVariationFilters = () => {
    const { results } = useHits();
    const { getAttributeLabel, sidebar: { variations } } = useStore();
    const [availableAttributes, setAvailableAttributes] = useState<Array<{ key: string, label: string }>>([]);

    useEffect(() => {
        const attributesSet = new Set<string>();

        // First, add attributes from facets
        if (results && results._rawResults && results._rawResults[0] && results._rawResults[0].facets) {
            const facets = results._rawResults[0].facets;

            // Dynamically find all variation_facets.* attributes from facets
            Object.keys(facets)
                .filter(facetKey => facetKey.startsWith('variation_facets.'))
                .forEach(facetKey => {
                    const attributeKey = facetKey.replace('variation_facets.', '');
                    const facetData = facets[facetKey];

                    // Only include facets that have data
                    if (facetData && Object.keys(facetData).length > 0 && !isHiddenVariationAttribute(attributeKey)) {
                        attributesSet.add(attributeKey);
                    }
                });
        }

        // Then, add attributes that have selected values (even if not in facets)
        Object.keys(variations).forEach(attributeKey => {
            if (variations[attributeKey] && variations[attributeKey].length > 0 && !isHiddenVariationAttribute(attributeKey)) {
                attributesSet.add(attributeKey);
            }
        });

        // Convert set to array with labels
        const variationFacets = Array.from(attributesSet).map(key => ({
            key,
            label: getAttributeLabel(key)
        }));

        setAvailableAttributes(variationFacets);
    }, [results, getAttributeLabel, variations]);

    // Don't render anything if no variation facets are available
    if (availableAttributes.length === 0) {
        return null;
    }

    return (
        <>
            {availableAttributes.map(attribute => (
                <VariationFilter
                    key={attribute.key}
                    attribute={attribute.key}
                    label={attribute.label}
                />
            ))}
        </>
    );
};

export default DynamicVariationFilters;
