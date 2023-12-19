import {create} from 'zustand'

type State = {
    sidebar: {
        categories: string[]
    }
}

type Actions = {
    syncCategories: (categories: string[]) => void
}

export const useStore = create<State & Actions>((set) => ({
    sidebar: {
        categories: []
    },
    syncCategories: (categories: string[]) => set((state) => ({
        sidebar: {
            ...state.sidebar,
            categories
        }
    })),
}))
