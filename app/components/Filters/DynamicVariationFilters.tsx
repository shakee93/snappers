import React, { useEffect, useState } from "react";
import { useHits } from "react-instantsearch";
import VariationFilter from "./VariationFilter";
import { useStore } from "@/store/store";

const DynamicVariationFilters = () => {
    const { results } = useHits();
    const { getAttributeLabel } = useStore();
    const [availableAttributes, setAvailableAttributes] = useState<Array<{ key: string, label: string }>>([]);

    useEffect(() => {
        if (results && results._rawResults && results._rawResults[0] && results._rawResults[0].facets) {
            const facets = results._rawResults[0].facets;

            // Dynamically find all variation_facets.* attributes from facets
            const variationFacets = Object.keys(facets)
                .filter(facetKey => facetKey.startsWith('variation_facets.'))
                .map(facetKey => {
                    const attributeKey = facetKey.replace('variation_facets.', '');
                    const facetData = facets[facetKey];

                    // Only include facets that have data
                    if (facetData && Object.keys(facetData).length > 0) {
                        return {
                            key: attributeKey,
                            label: getAttributeLabel(attributeKey)
                        };
                    }
                    return null;
                })
                .filter(Boolean) as Array<{ key: string, label: string }>;

            setAvailableAttributes(variationFacets);
        }
    }, [results, getAttributeLabel]);

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
