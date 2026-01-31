import type { Feature } from "geojson";
import type { EstadoIncendio, PuntoIncendio } from "../puntos/types";

/**
 * Verifica si un incendio está activo según su estado actual
 *
 * @param incendio - Punto de incendio a evaluar.
 * @returns true si el estado es confirmado, bajo_control o detectado.
 */
export function isIncendioActive(incendio: PuntoIncendio): boolean {
    return (['confirmado', 'bajo_control', 'detectado'] as EstadoIncendio[]).includes(incendio.estado);
}

/**
 * Extra el nombre de región de una "feature" del GeoJSON de regiones
 *
 * @param {Feature} feature - Elemento a procesar.
 * @returns {string} Nombre de la región, o 'Desconocida' si no se pudo extraer.
 */
export function getNombreRegión(feature: Feature): string {
    return feature.properties?.Region || feature.properties?.NOM_REG || "Desconocida";
}