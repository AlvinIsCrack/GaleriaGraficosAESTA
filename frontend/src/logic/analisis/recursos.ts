/**
 * Calcula de forma dinámica la distribución de personal y maquinaria
 * desplegada en base a la intensidad y cantidad de incendios activos.
 */

import { isIncendioActive } from "../core/utils";
import { MOCK_FOCOS } from "../puntos/focos";
import { baseRandom } from "./helpers";

const focosActivos = MOCK_FOCOS.filter(isIncendioActive);
const factorIntensidad = Math.max(0.2, Math.min(focosActivos.length / 3, 1.5));

export const obtenerRecursosDesplegados = () => {
    const isGranIncendio = factorIntensidad > 1.2;

    const data = [
        {
            tipo: "Personal de Combate",
            cantidad: Math.round(baseRandom(50, 100) * factorIntensidad * 3),
            class: "fill-amber-500 text-amber-400",
            icon: "user"
        },
        {
            tipo: "Unidades de Bomberos",
            cantidad: Math.round(baseRandom(10, 30) * factorIntensidad),
            class: "fill-rose-600 text-rose-500",
        },
        {
            tipo: "Aeronaves",
            cantidad: Math.round(baseRandom(5, 15) * factorIntensidad) + (isGranIncendio ? 1 : 0),
            class: "fill-emerald-500 text-emerald-400",
        },
        {
            tipo: "Maquinaria Pesada",
            cantidad: Math.round(baseRandom(2, 8) * factorIntensidad),
            class: "fill-muted-foreground text-muted-foreground",
        }
    ];

    return data.sort((a, b) => b.cantidad - a.cantidad);
};

export const recursosDesplegados = obtenerRecursosDesplegados();