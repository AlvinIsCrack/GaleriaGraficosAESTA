/**
 * Funciones auxiliares específicas para el análisis, centradas en
 * cálculos matemáticos y normalización de nombres para reportes.
 */

import { getNombreRegión } from "../core/utils";

export const calcularAreaCirculo = (radioKm: number) => Math.PI * (radioKm ** 2);

export const normalizarNombreRegion = (feature: any): string => {
    const nombreOriginal = getNombreRegión(feature);
    return nombreOriginal
        .replace(/^Región(?:\s+de)?(?:l\s+|\s+)| de Santiago$/gi, "")
        .replace("Libertador Bernardo O'Higgins", "O'Higgins")
        .trim();
};

export const baseRandom = (min: number, max: number) => min + Math.random() * (max - min);