import {create} from 'zustand'

type State = {
    sidebar: {
        categories: string[]
    }
}

type Actions = {
    syncCategories: (categories: string[]) => void
    syncBrands: (brands: string[]) => void
}

export const useStore = create<State & Actions>((set) => ({
    sidebar: {
        categories: [],
        brands: []
    },
    syncCategories: (categories: string[]) => set((state) => ({
        sidebar: {
            ...state.sidebar,
            categories
        }
    })),
    syncBrands: (brands: string[]) => set((state) => ({
        sidebar: {
            ...state.sidebar,
            brands
        }
    })),
}))
