/**
 * Módulo principal de análisis que consolida todos los datos calculados
 * (daños, amenazas, clima y recursos) en un único objeto de exportación.
 */

import { MOCK_FOCOS } from "../puntos/focos";
import { METROS_POR_HECTAREA } from "../core/constantes";
import { kmTotales, obtenerPoblacionAfectada, obtenerToneladasBiomasa } from "./daños";
import { obtenerClimaRegional, topRegiones } from "./regiones";
import { recursosDesplegados } from "./recursos";

export const ANALISIS_DATA = {
    daños: {
        km: kmTotales,
        hectáreas: kmTotales * METROS_POR_HECTAREA,
    },
    amenazas: {
        población: obtenerPoblacionAfectada(),
        toneladasBiomasa: obtenerToneladasBiomasa(),
    },
    clima: obtenerClimaRegional(topRegiones),
    recursos: recursosDesplegados,
    distribucion: {
        topRegiones: topRegiones,
        totalFocosAnalizados: MOCK_FOCOS.length
    }
} as const;