import { useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useStore } from '@/store/store';
import { attributeMappingService } from '@/utils/attributeMappingService';
import { GET_ALL_PRODUCT_ATTRIBUTES } from '@/graphql/defs/products';

/**
 * Hook to initialize attribute mappings on app startup
 * This loads all product attributes in the background once using useLazyQuery
 */
export const useAttributeMappings = () => {
    const {
        attributeMappingsLoaded,
        setAttributeMappings,
        setAttributeMappingsLoaded
    } = useStore();

    const [loadAttributes, { data, loading, error }] = useLazyQuery(GET_ALL_PRODUCT_ATTRIBUTES, {
        fetchPolicy: 'cache-first',
        onCompleted: (data) => {
            attributeMappingService.setAttributeMappings(data);
            const mappings = attributeMappingService.getAllMappings();
            setAttributeMappings(mappings);
        },
        onError: (error) => {
            console.error('Failed to initialize attribute mappings:', error);
            setAttributeMappingsLoaded(false);
        }
    });

    useEffect(() => {
        // Only load if not already loaded
        if (!attributeMappingsLoaded && !loading) {
            loadAttributes();
        }
    }, [attributeMappingsLoaded, loading, loadAttributes]);

    return {
        isLoaded: attributeMappingsLoaded,
        mappings: attributeMappingService.getAllMappings(),
        loading,
        error
    };
};
