import {create} from 'zustand'

type State = {
    sidebar: {
        mounted: number
        categories: string[],
        brands: string[]
    }
}

type Actions = {
    syncCategories: (categories: string[]) => void
    syncBrands: (brands: string[]) => void
    setMounted: () => void
}

export const useStore = create<State & Actions>((set) => ({
    sidebar: {
        categories: [],
        brands: [],
        mounted: 0,
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
    setMounted: () => set((state) => ({
        sidebar: {
            ...state.sidebar,
            mounted: state.sidebar.mounted + 1,
        }
    }))
}))
