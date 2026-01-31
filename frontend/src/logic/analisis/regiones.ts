import * as d3 from 'd3';
import { normalizarNombreRegion } from "./helpers";
import { obtenerHumedadSimulada, obtenerTemperaturaSimulada, obtenerVientoSimulado } from "./simulacion";
import { CHILE_GEO_DATA } from '../geodata/chile';
import { MOCK_FOCOS } from '../puntos/focos';
import { isIncendioActive } from '../core/utils';

export const obtenerTopRegionesAfectadas = () => {
    const conteoPorRegion = CHILE_GEO_DATA.features.map((feature: any) => {
        const focosEnRegion = MOCK_FOCOS.filter(foco =>
            d3.geoContains(feature, [foco.lng, foco.lat])
        );

        const activos = focosEnRegion.filter(isIncendioActive).length;

        return {
            id: feature.id,
            nombre: normalizarNombreRegion(feature),
            cantidad: focosEnRegion.length,
            cantidadActivos: activos,
            nivelRiesgo: activos >= 3 ? "alto" : activos > 0 ? "medio" : "bajo"
        } as const;
    });

    const regionesConFocos = conteoPorRegion.filter(r => r.cantidad > 0);
    const ordenadasPorGravedad = regionesConFocos.sort((a, b) => b.cantidad - a.cantidad);

    return ordenadasPorGravedad.slice(0, 5);
};

export const obtenerClimaRegional = (topRegiones: ReturnType<typeof obtenerTopRegionesAfectadas>) => {
    return topRegiones.map(regionInfo => {
        const feature = CHILE_GEO_DATA.features.find(f => f.id === regionInfo.id);
        if (!feature) return null;

        const centroide = d3.geoCentroid(feature);
        const latitud = centroide[1];
        const factorClimaticoLatitud = (latitud + 33) * 1.5;

        const tempBase = obtenerTemperaturaSimulada() + factorClimaticoLatitud;
        const humBase = obtenerHumedadSimulada() - (factorClimaticoLatitud * 0.5);
        const vientoBase = obtenerVientoSimulado();

        const temperatura = Math.round(tempBase);
        const humedad = Math.round(Math.max(5, humBase));
        const viento = Math.round(vientoBase);

        return {
            region: regionInfo.nombre,
            id: regionInfo.id,
            metricas: {
                temperatura: { valor: temperatura, unidad: "°C", peligro: temperatura > 30 },
                humedad: { valor: humedad, unidad: "%", peligro: humedad < 30 },
                viento: { valor: viento, unidad: "km/h", peligro: viento > 30 }
            }
        };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
};

export const topRegiones = obtenerTopRegionesAfectadas();