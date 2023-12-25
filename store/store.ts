import {create} from 'zustand'
import {ProductAttribute} from "@/graphql/types/graphql";

type State = {
    sidebar: {
        mounted: number
        categories: string[],
        brands: string[]
    }
    product: {
        attribute: any[]
    }
}

type Actions = {
    syncCategories: (categories: string[]) => void
    syncBrands: (brands: string[]) => void
    setMounted: () => void
    setAttribute: (attr: ProductAttribute, option: string) => void
}

export const useStore = create<State & Actions>((set) => ({
    sidebar: {
        categories: [],
        brands: [],
        mounted: 0,
    },
    product: {
        attribute: []
    },
    syncCategories: (categories: string[]) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            categories
        },
    })),
    syncBrands: (brands: string[]) => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            brands
        },
    })),
    setMounted: () => set((state) => ({
        ...state,
        sidebar: {
            ...state.sidebar,
            mounted: state.sidebar.mounted + 1,
        },
    })),
    setAttribute: (value: ProductAttribute, option) => set((state) => {
        const product = {
            attribute: state.product.attribute
        }

        const paAttr = product.attribute.find(a => a.attr.name === value.name);

        if (paAttr) {
            product.attribute = product.attribute.map(attr => {
                attr.option = option
                return attr
            })
        } else {
            product.attribute.push({
                attr: value,
                option: option
            });
        }


        return {
            ...state,
            product : product
        }
    })

}))
