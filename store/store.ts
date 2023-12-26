import {create} from 'zustand'
import {ProductAttribute, VariationAttribute} from "@/graphql/types/graphql";

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
    setAttribute: (attr: ProductAttribute | VariationAttribute, option: string) => void
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
