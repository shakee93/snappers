'use client';

import { useAttributeMappings } from '@/hooks/useAttributeMappings';

/**
 * Component to initialize attribute mappings in the background
 * This should be placed high in the component tree to ensure
 * mappings are loaded early
 */
const AttributeMappingsInitializer = () => {
    useAttributeMappings();
    return null; // This component doesn't render anything
};

export default AttributeMappingsInitializer;
