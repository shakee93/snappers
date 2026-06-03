import { create } from 'zustand'
import { ProductAttribute, VariationAttribute } from "@/graphql/types/graphql";
import { PRICE_RANGE } from "@/components/global/primitives/Filters/PriceFilter";
import { AttributeMapping } from "@/utils/attributeMappingService";

type State = {
    search: string,
    search_status: string,
    navigation: string[],
    mobileMenu: boolean,
    sidebar: {
        mounted: number
        categories: number[],
        brands: number[]
        priceRange: number[],
        on_sale: boolean,
        sort: string
        in_stock: boolean
        variations: Record<string, string[]>
    }
    product: {
        attribute: any[]
        activeVariationId: number | null
    }
    searchMounted: boolean
    isTyping: boolean
    attributeMappings: Map<string, AttributeMapping>
    attributeMappingsLoaded: boolean
}

type Actions = {
    syncCategories: (categories: number[]) => void
    syncOnSale: (onSale: boolean) => void
    setInStock: (onSale: boolean) => void
    toggleMobileMenu: (onSale?: boolean) => void
    setSort: (sort: string) => void
    setSearch: (search: string) => void
    pushNavigation: (event: string) => void
    setSearchStatus: (status: string) => void
    syncBrands: (brands: number[]) => void
    synPriceRange: (brands: number[]) => void
    syncVariations: (attribute: string, values: string[]) => void
    clearVariations: () => void
    setMounted: () => void
    setSearchMounted: () => void
    setIsTyping: (isTyping: boolean) => void
    clearAttributes: () => void
    setActiveVariationId: (id: number | null) => void
    setAttribute: (attr: ProductAttribute | VariationAttribute, option: string) => void
    setAttributeMappings: (mappings: Map<string, AttributeMapping>) => void
    setAttributeMappingsLoaded: (loaded: boolean) => void
    getAttributeLabel: (slug: string) => string
    getTermLabel: (attributeSlug: string, termSlug: string) => string
}

export const useStore = create<State & Actions>((set, get) => ({
    search: "",
    search_status: '',
    navigation: [],
    mobileMenu: false,
    sidebar: {
        categories: [],
        brands: [],
        mounted: 0,
        priceRange: PRICE_RANGE,
        on_sale: false,
        sort: "",
        in_stock: false,
        variations: {}
    },
    searchMounted: false,
    isTyping: false,
    product: {
        attribute: [],
        activeVariationId: null,
    },
    attributeMappings: new Map(),
    attributeMappingsLoaded: false,
    setSearchMounted: () => set((state) => ({
        ...state,
        searchMounted: true
    })),
    setIsTyping: (isTyping: boolean) => set((state) => ({
        ...state,
        isTyping
    })),
    setSort: (sort: string) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            sort
        },
    })),
    setSearchStatus: (search_status: string) => set((state) => ({
        ...state,
        search_status
    })),
    setSearch: (search: string) => set((state) => ({
        ...state,
        search
    })),
    toggleMobileMenu: (mobile?: boolean) => set((state) => ({
        ...state,
        mobileMenu: mobile ? mobile : !state.mobileMenu
    })),
    pushNavigation: (event: string) => set((state) => {

        if (state.navigation.length > 0 && state.navigation[state.navigation.length - 1] === event) {
            return state;
        }

        return {
            ...state,
            navigation: [
                ...state.navigation,
                event
            ]
        }
    }),
    setInStock: (in_stock: boolean) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            in_stock
        },
    })),
    syncOnSale: (on_sale: boolean) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            on_sale: on_sale
        },
    })),
    syncCategories: (categories: number[]) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            categories
        },
    })),
    syncBrands: (brands: number[]) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            brands
        },
    })),
    synPriceRange: (priceRange: number[]) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            priceRange
        },
    })),
    syncVariations: (attribute: string, values: string[]) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            variations: {
                ...state.sidebar.variations,
                [attribute]: values
            }
        },
    })),
    clearVariations: () => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            variations: {}
        },
    })),
    setMounted: () => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            mounted: state.sidebar.mounted + 1,
        },
    })),
    setAttribute: (value: VariationAttribute, option) => set((state) => {
        const product = {
            attribute: state.product.attribute,
            activeVariationId: state.product.activeVariationId,
        }

        const paAttr = product.attribute.find(a => a.name === value.name);

        if (paAttr) {
            product.attribute = product.attribute.map(attr => {

                if (attr.name === value.name) {
                    attr.val = option;
                }

                return attr
            })
        } else {
            product.attribute.push({
                ...value,
                val: option
            });
        }


        return {
            ...state,
            product: product
        }
    }),
    clearAttributes: () => set((state) => ({
        ...state,
        product: {
            attribute: [],
            activeVariationId: null,
        }
    })),
    setActiveVariationId: (activeVariationId: number | null) => set((state) => ({
        ...state,
        product: {
            ...state.product,
            activeVariationId,
        }
    })),
    setAttributeMappings: (mappings: Map<string, AttributeMapping>) => set((state) => ({
        ...state,
        attributeMappings: mappings,
        attributeMappingsLoaded: true
    })),
    setAttributeMappingsLoaded: (loaded: boolean) => set((state) => ({
        ...state,
        attributeMappingsLoaded: loaded
    })),
    getAttributeLabel: (slug: string) => {
        const state = get();
        const mapping = state.attributeMappings.get(slug);
        if (mapping) {
            return mapping.label;
        }

        // Fallback to formatted slug
        return slug
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },
    getTermLabel: (attributeSlug: string, termSlug: string) => {
        const state = get();
        const mapping = state.attributeMappings.get(attributeSlug);
        if (mapping && mapping.terms) {
            const term = mapping.terms.find(t => t.slug === termSlug);
            if (term) {
                return term.name;
            }
        }

        // Fallback to formatted term slug
        return termSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

}))
