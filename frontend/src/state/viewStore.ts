import { create } from 'zustand';

/**
 * Interfaz para el estado global de visualización.
 * Permite la sincronización entre componentes independientes (ej. Mapa y Gráficos).
 */
interface ViewState {
    /** ID de la región actualmente resaltada o seleccionada en el dashboard */
    focusedRegion: string | null;
    /** Actualiza la región en foco para gatillar efectos visuales en el resto de la interfaz */
    setFocusedRegion: (region: string | null) => void;
}

/**
 * Store de Zustand para la gestión de estado global ligero.
 * Se prefiere sobre React Context para evitar re-renderizados innecesarios en visualizaciones 
 * de alta frecuencia (como D3.js) y mantener un singleton limpio de acceso global.
 */
const useViewStore = create<ViewState>((set) => ({
    focusedRegion: null,
    setFocusedRegion: (region) => set({ focusedRegion: region }),
}));

export default useViewStore;