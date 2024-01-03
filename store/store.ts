import {create} from 'zustand'
import {ProductAttribute, VariationAttribute} from "@/graphql/types/graphql";
import {PRICE_RANGE} from "@/app/components/Filters/PriceFilter";

type State = {
    search: string,
    search_status: string,
    navigation: string[]
    sidebar: {
        mounted: number
        categories: number[],
        brands: number[]
        priceRange: number[],
        on_sale: boolean,
        sort: string
        in_stock: boolean
    }
    product: {
        attribute: any[]
    }
}

type Actions = {
    syncCategories: (categories: number[]) => void
    syncOnSale: (onSale:boolean) => void
    setInStock: (onSale:boolean) => void
    setSort: (sort:string) => void
    setSearch: (search:string) => void
    pushNavigation: (event:string) => void
    setSearchStatus: (status:string) => void
    syncBrands: (brands: number[]) => void
    synPriceRange: (brands: number[]) => void
    setMounted: () => void
    setAttribute: (attr: ProductAttribute | VariationAttribute, option: string) => void
}

export const useStore = create<State & Actions>((set) => ({
    search: "",
    search_status: '',
    navigation: [],
    sidebar: {
        categories: [],
        brands: [],
        mounted: 0,
        priceRange: PRICE_RANGE,
        on_sale: false,
        sort: "",
        in_stock: false
    },
    product: {
        attribute: []
    },
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
    setMounted: () => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            mounted: state.sidebar.mounted + 1,
        },
    })),
    setAttribute: (value: VariationAttribute, option) => set((state) => {
        const product = {
            attribute: state.product.attribute
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
            product : product
        }
    })

}))
