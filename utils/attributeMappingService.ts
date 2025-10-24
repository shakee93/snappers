import { GET_ALL_PRODUCT_ATTRIBUTES } from '@/graphql/defs/products';

export interface AttributeMapping {
    slug: string;
    name: string;
    label: string;
    terms: Array<{
        name: string;
        slug: string;
    }>;
}

class AttributeMappingService {
    private attributeMappings: Map<string, AttributeMapping> = new Map();
    private isLoaded = false;

    /**
     * Set attribute mappings from GraphQL data
     */
    setAttributeMappings(data: any): void {
        if (data?.allProductAttributes) {
            data.allProductAttributes.forEach((attr: any) => {
                this.attributeMappings.set(attr.slug, {
                    slug: attr.slug,
                    name: attr.name,
                    label: attr.name, // Use name as label, or you can customize this
                    terms: attr.terms || []
                });
            });
            this.isLoaded = true;
        }
    }

    /**
     * Get attribute mapping by slug
     */
    getAttributeMapping(slug: string): AttributeMapping | undefined {
        return this.attributeMappings.get(slug);
    }

    /**
     * Get attribute label by slug, fallback to formatted slug if not found
     */
    getAttributeLabel(slug: string): string {
        const mapping = this.getAttributeMapping(slug);
        if (mapping) {
            return mapping.label;
        }

        // Fallback to formatted slug
        return this.formatAttributeLabel(slug);
    }

    /**
     * Get term label by attribute slug and term slug
     * This is used to map facet values to proper term labels
     */
    getTermLabel(attributeSlug: string, termSlug: string): string {
        const mapping = this.getAttributeMapping(attributeSlug);
        if (mapping && mapping.terms) {
            const term = mapping.terms.find(t => t.slug === termSlug);
            if (term) {
                return term.name;
            }
        }

        // Fallback to formatted term slug
        return this.formatTermLabel(termSlug);
    }

    /**
     * Format term slug to readable label
     */
    private formatTermLabel(slug: string): string {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get all loaded attribute mappings
     */
    getAllMappings(): Map<string, AttributeMapping> {
        return new Map(this.attributeMappings);
    }

    /**
     * Check if mappings are loaded
     */
    isMappingsLoaded(): boolean {
        return this.isLoaded;
    }

    /**
     * Format attribute slug to readable label
     */
    private formatAttributeLabel(slug: string): string {
        return slug
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Reset the service (useful for testing)
     */
    reset(): void {
        this.attributeMappings.clear();
        this.isLoaded = false;
    }
}

// Export singleton instance
export const attributeMappingService = new AttributeMappingService();