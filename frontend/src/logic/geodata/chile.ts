/**
 * Gestión de datos geoespaciales. Procesa y exporta la información
 * de las regiones de Chile basada en GeoJSON para su uso en cálculos y mapas.
 */

import type { FeatureCollection } from "geojson";
// El GeoJSON se iimporta como asset, evitando el uso de fetch innecesario por simplicidad
import rawGeoData from "../../assets/geo/regiones.json";

const processedFeatures = (rawGeoData as FeatureCollection).features.map((feature) => ({
    ...feature,
    id: feature.properties?.codregion // Esto es para facilitar procesamiento a nivel de frontend
}));

export const CHILE_GEO_DATA = {
    ...rawGeoData,
    features: processedFeatures,
} as FeatureCollection;