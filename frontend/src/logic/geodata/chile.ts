import type { FeatureCollection } from "geojson";
import rawGeoData from "../../assets/geo/regiones.json";

const processedFeatures = (rawGeoData as FeatureCollection).features.map((feature) => ({
    ...feature,
    id: feature.properties?.codregion,
}));

export const CHILE_GEO_DATA = {
    ...rawGeoData,
    features: processedFeatures,
} as FeatureCollection;