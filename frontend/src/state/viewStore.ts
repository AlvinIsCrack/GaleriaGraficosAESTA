import { create } from 'zustand';

/** Para simple interactividad con variables 'globales', en un singleton/store */
interface ViewState {
    focusedRegion: string | null;
    setFocusedRegion: (region: string | null) => void;
}

// Se usa zustand para evitar uso engorroso de useContext
const useViewStore = create<ViewState>((set) => ({
    focusedRegion: null,
    setFocusedRegion: (region) => set({ focusedRegion: region }),
}));

export default useViewStore;