import { isIncendioActive } from "../core/utils";
import { MOCK_FOCOS } from "../puntos/focos";
import { baseRandom } from "./helpers";

const focosActivos = MOCK_FOCOS.filter(isIncendioActive);
const factorIntensidad = Math.max(0.2, Math.min(focosActivos.length / 3, 1.5));

export const obtenerRecursosDesplegados = () => {
    const data = [
        {
            tipo: "Brigadistas",
            cantidad: Math.round(baseRandom(40, 80) * factorIntensidad * 4),
            color: "var(--color-orange-500)",
            icon: "user"
        },
        {
            tipo: "Aeronaves",
            cantidad: Math.round(baseRandom(3, 8) * factorIntensidad),
            color: "var(--color-emerald-500)",
            icon: "plane"
        },
        {
            tipo: "Carros Bomba",
            cantidad: Math.round(baseRandom(10, 25) * factorIntensidad),
            color: "var(--color-red-700)",
            icon: "truck"
        },
        {
            tipo: "Maquinaria",
            cantidad: Math.round(baseRandom(2, 6) * factorIntensidad),
            color: "var(--color-zinc-500)",
            icon: "hammer"
        }
    ];

    return data.sort((a, b) => b.cantidad - a.cantidad);
};

export const recursosDesplegados = obtenerRecursosDesplegados();