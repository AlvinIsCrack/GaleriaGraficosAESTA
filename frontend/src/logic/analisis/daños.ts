/**
 * Lógica de cálculo para la estimación de daños ambientales y sociales,
 * incluyendo área afectada, población en riesgo y pérdida de biomasa.
 */

import { MOCK_FOCOS } from "../puntos/focos";
import { KM_POR_GRADO, METROS_POR_HECTAREA } from "../core/constantes";
import { calcularAreaCirculo } from "./helpers";

export const focosValidos = MOCK_FOCOS.filter(f => f.estado !== 'falsa_alarma');
export const focosActivos = focosValidos.filter(f => f.estado !== 'bajo_control');

export const obtenerKmDaños = () => {
    const focosOrdenadosPorTamaño = [...focosValidos].sort((a, b) => b.radioKm - a.radioKm);

    return focosOrdenadosPorTamaño.reduce((acumulado, focoActual, indice, lista) => {
        const focosPreviosMasGrandes = lista.slice(0, indice);

        const estaTotalmenteSolapado = focosPreviosMasGrandes.some(focoGrande => {
            const diferenciaLat = focoGrande.lat - focoActual.lat;
            const diferenciaLng = focoGrande.lng - focoActual.lng;

            const distanciaGrados = Math.sqrt(
                Math.pow(diferenciaLat, 2) + Math.pow(diferenciaLng, 2)
            );

            const distanciaKm = distanciaGrados * KM_POR_GRADO;
            return distanciaKm + focoActual.radioKm <= focoGrande.radioKm;
        });

        if (estaTotalmenteSolapado) {
            return acumulado;
        }

        const areaFoco = calcularAreaCirculo(focoActual.radioKm);
        const dañoEfectivo = areaFoco * focoActual.intensidad;

        return acumulado + dañoEfectivo;
    }, 0);
};

export const obtenerPoblacionAfectada = () => {
    return focosActivos.reduce((acumulado, foco) => {
        const area = calcularAreaCirculo(foco.radioKm);

        let densidadChile = 40;
        if (foco.radioKm < 1) {
            densidadChile = 1000;
        } else if (foco.radioKm < 5) {
            densidadChile = 400;
        }

        const intensidadEfectiva = foco.intensidad > 0 ? foco.intensidad : 0.1;
        const estimacionPersonas = area * densidadChile * intensidadEfectiva;

        return acumulado + Math.max(estimacionPersonas, 0);
    }, 0);
};

export const obtenerToneladasBiomasa = () => {
    return focosActivos.reduce((acumulado, foco) => {
        const areaKm = calcularAreaCirculo(foco.radioKm);
        const hectareas = areaKm * METROS_POR_HECTAREA;

        let toneladasPorHectarea = 50;
        if (foco.lat < -37) {
            toneladasPorHectarea = 200;
        } else if (foco.lat < -33) {
            toneladasPorHectarea = 100;
        }

        const biomasaFoco = hectareas * toneladasPorHectarea * foco.intensidad;
        return acumulado + biomasaFoco;
    }, 0);
};

export const kmTotales = obtenerKmDaños();