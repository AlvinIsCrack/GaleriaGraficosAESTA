/**
 * Punto de entrada para los datos de incendios. Contiene el dataset base
 * y la lógica de generación de datos simulados (mock) para la visualización.
 */

import type { PuntoIncendio } from './types';

/** Pequeño dataset generado por IA */
const BASE_FOCOS_INCENDIO = [
    { id: '1', lat: -33.0472, lng: -71.4425, intensidad: 0.9, estado: 'confirmado', radioKm: 2.5, nombre: 'Reserva Lago Peñuelas' },
    { id: '2', lat: -33.1234, lng: -71.5567, intensidad: 0.4, estado: 'bajo_control', radioKm: 0.8, nombre: 'Fundo Las Tablas' },
    { id: '3', lat: -33.4489, lng: -70.6693, intensidad: 0.1, estado: 'falsa_alarma', radioKm: 0.1, nombre: 'Cerro Santa Lucía' },
    { id: '4', lat: -33.5833, lng: -70.5833, intensidad: 0.7, estado: 'detectado', radioKm: 1.2, nombre: 'Cajón del Maipo - El Canelo' },
    { id: '5', lat: -34.1708, lng: -70.7444, intensidad: 0.3, estado: 'extinguido', radioKm: 0.4, nombre: 'Coya' },
    { id: '6', lat: -34.5922, lng: -71.6733, intensidad: 0.8, estado: 'confirmado', radioKm: 3.5, nombre: 'Pumanque - El Boldo' },
    { id: '7', lat: -35.3322, lng: -72.4133, intensidad: 0.95, estado: 'confirmado', radioKm: 8.2, nombre: 'Empedrado Sector Norte' },
    { id: '8', lat: -35.4264, lng: -71.6554, intensidad: 0.5, estado: 'bajo_control', radioKm: 1.1, nombre: 'Talca - Cerro de la Virgen' },
    { id: '9', lat: -36.5228, lng: -72.9511, intensidad: 0.2, estado: 'extinguido', radioKm: 0.3, nombre: 'Dichato Forestal' },
    { id: '10', lat: -37.1701, lng: -72.7039, intensidad: 0.85, estado: 'confirmado', radioKm: 5.4, nombre: 'Santa Juana - Cordillera de Nahuelbuta' },
    { id: '11', lat: -37.4697, lng: -72.3539, intensidad: 0.6, estado: 'bajo_control', radioKm: 2.1, nombre: 'Los Ángeles - Salto del Laja' },
    { id: '12', lat: -38.2439, lng: -72.7167, intensidad: 0.75, estado: 'detectado', radioKm: 2.8, nombre: 'Purén - Las Cardas' },
    { id: '13', lat: -38.4167, lng: -72.7833, intensidad: 0.9, estado: 'confirmado', radioKm: 6.1, nombre: 'Galvarino Sector Rural' },
    { id: '14', lat: -39.0289, lng: -72.1056, intensidad: 0.4, estado: 'bajo_control', radioKm: 0.9, nombre: 'Villarrica - Camino Ñancul' },
    { id: '15', lat: -41.4689, lng: -72.9411, intensidad: 0.2, estado: 'detectado', radioKm: 0.2, nombre: 'Puerto Montt - Alerce' },
    { id: '16', lat: -33.7442, lng: -71.2134, intensidad: 0.65, estado: 'confirmado', radioKm: 1.8, nombre: 'Melipilla - Popeta' },
    { id: '17', lat: -36.1422, lng: -71.8233, intensidad: 0.1, estado: 'falsa_alarma', radioKm: 0.05, nombre: 'Parral - Cruce Retiro' },
    { id: '18', lat: -37.2556, lng: -73.3167, intensidad: 0.8, estado: 'confirmado', radioKm: 4.2, nombre: 'Arauco - Sector El Pino' },
    { id: '19', lat: -32.8333, lng: -71.2500, intensidad: 0.5, estado: 'bajo_control', radioKm: 1.5, nombre: 'Limache - Cerro La Campana' },
    { id: '20', lat: -34.7211, lng: -71.1522, intensidad: 0.3, estado: 'extinguido', radioKm: 0.7, nombre: 'Lolol Forestal' },
    { id: '21', lat: -32.4542, lng: -71.2311, intensidad: 0.7, estado: 'confirmado', radioKm: 1.4, nombre: 'Cabildo - El Quemado' },
    { id: '22', lat: -32.9811, lng: -71.3244, intensidad: 0.8, estado: 'detectado', radioKm: 2.0, nombre: 'Villa Alemana - Peñablanca' },
    { id: '24', lat: -33.3544, lng: -71.6522, intensidad: 0.6, estado: 'confirmado', radioKm: 1.3, nombre: 'Algarrobo Norte' },
    { id: '25', lat: -33.4122, lng: -70.9233, intensidad: 0.3, estado: 'extinguido', radioKm: 0.5, nombre: 'Curacaví - Cuesta Zapata' },
    { id: '26', lat: -33.7211, lng: -70.7544, intensidad: 0.5, estado: 'detectado', radioKm: 0.8, nombre: 'Buin - Alto Jahuel' },
    { id: '27', lat: -33.8544, lng: -71.4211, intensidad: 0.9, estado: 'confirmado', radioKm: 3.2, nombre: 'San Pedro - Las Golondrinas' },
    { id: '28', lat: -33.9811, lng: -70.1233, intensidad: 0.2, estado: 'falsa_alarma', radioKm: 0.1, nombre: 'San José de Maipo - Embalse El Yeso' },
    { id: '29', lat: -34.0233, lng: -71.6544, intensidad: 0.75, estado: 'confirmado', radioKm: 2.1, nombre: 'Litueche - Central Rapel' },
    { id: '30', lat: -34.2544, lng: -71.9211, intensidad: 0.4, estado: 'bajo_control', radioKm: 1.2, nombre: 'Pichilemu - Punta de Lobos Rural' },
    { id: '31', lat: -34.4233, lng: -71.0544, intensidad: 0.85, estado: 'confirmado', radioKm: 3.0, nombre: 'San Fernando - Termas del Flaco' },
    { id: '32', lat: -34.8544, lng: -72.1233, intensidad: 0.6, estado: 'detectado', radioKm: 1.7, nombre: 'Vichuquén - Lago Alto' },
    { id: '33', lat: -35.1233, lng: -71.2544, intensidad: 0.3, estado: 'extinguido', radioKm: 0.6, nombre: 'Molina - Siete Tazas' },
    { id: '34', lat: -35.2544, lng: -72.3544, intensidad: 0.95, estado: 'confirmado', radioKm: 7.0, nombre: 'Constitución - Cerro Mutrún' },
    { id: '35', lat: -35.5811, lng: -71.9544, intensidad: 0.5, estado: 'bajo_control', radioKm: 1.4, nombre: 'San Javier - Loncomilla' },
    { id: '37', lat: -36.2122, lng: -71.4211, intensidad: 0.4, estado: 'detectado', radioKm: 0.9, nombre: 'Linares - Cajón de Achibueno' },
    { id: '38', lat: -36.4233, lng: -72.8544, intensidad: 0.7, estado: 'confirmado', radioKm: 1.8, nombre: 'Coelemu - Vegas de Itata' },
    { id: '39', lat: -36.6544, lng: -72.4544, intensidad: 0.9, estado: 'confirmado', radioKm: 5.0, nombre: 'Quillón - Cerro Negro' },
    { id: '40', lat: -36.8544, lng: -73.0233, intensidad: 0.2, estado: 'extinguido', radioKm: 0.3, nombre: 'Penco - El Refugio' },
    { id: '41', lat: -37.0544, lng: -72.4211, intensidad: 0.65, estado: 'bajo_control', radioKm: 1.5, nombre: 'Yumbel - Estación' },
    { id: '42', lat: -37.3233, lng: -72.6544, intensidad: 0.8, estado: 'confirmado', radioKm: 2.2, nombre: 'Laja - Altos del Laja' },
    { id: '43', lat: -37.5233, lng: -73.5544, intensidad: 0.75, estado: 'detectado', radioKm: 1.9, nombre: 'Lebu - Pehuén' },
    { id: '44', lat: -37.8544, lng: -73.2233, intensidad: 0.9, estado: 'confirmado', radioKm: 4.0, nombre: 'Cañete - Lago Lanalhue' },
    { id: '45', lat: -38.1233, lng: -71.9544, intensidad: 0.4, estado: 'bajo_control', radioKm: 1.1, nombre: 'Angol - Cordillera Nahuelbuta Este' },
    { id: '46', lat: -38.3544, lng: -72.3544, intensidad: 0.6, estado: 'confirmado', radioKm: 1.6, nombre: 'Victoria - Traiguén' },
    { id: '47', lat: -38.6544, lng: -71.2133, intensidad: 0.85, estado: 'confirmado', radioKm: 3.1, nombre: 'Lonquimay - Paso Pino Hachado' },
    { id: '48', lat: -38.8233, lng: -72.9544, intensidad: 0.3, estado: 'extinguido', radioKm: 0.5, nombre: 'Carahue - Costa' },
    { id: '49', lat: -39.1233, lng: -73.2133, intensidad: 0.5, estado: 'bajo_control', radioKm: 1.2, nombre: 'Puerto Saavedra - Lago Budi' },
    { id: '50', lat: -39.3544, lng: -72.0233, intensidad: 0.7, estado: 'detectado', radioKm: 1.9, nombre: 'Pucón - Volcán Villarrica' },
    { id: '51', lat: -39.6544, lng: -72.8544, intensidad: 0.4, estado: 'confirmado', radioKm: 1.0, nombre: 'Lanco - Malalhue' },
    { id: '52', lat: -39.8211, lng: -73.2244, intensidad: 0.2, estado: 'falsa_alarma', radioKm: 0.1, nombre: 'Valdivia - Isla Teja' },
    { id: '53', lat: -40.1233, lng: -72.4544, intensidad: 0.65, estado: 'bajo_control', radioKm: 1.5, nombre: 'Lago Ranco - Futrono' },
    { id: '54', lat: -40.4233, lng: -72.9544, intensidad: 0.8, estado: 'confirmado', radioKm: 2.1, nombre: 'Río Bueno - San Pablo' },
    { id: '55', lat: -40.7544, lng: -73.1233, intensidad: 0.3, estado: 'extinguido', radioKm: 0.5, nombre: 'Osorno - Rahue' },
    { id: '56', lat: -41.1233, lng: -72.6544, intensidad: 0.5, estado: 'detectado', radioKm: 1.1, nombre: 'Frutillar - Llanquihue' },
    { id: '57', lat: -41.3544, lng: -72.1233, intensidad: 0.75, estado: 'confirmado', radioKm: 2.2, nombre: 'Ensenada - Volcán Osorno' },
    { id: '58', lat: -41.8233, lng: -73.8233, intensidad: 0.4, estado: 'bajo_control', radioKm: 0.8, nombre: 'Ancud - Chiloé Norte' },
    { id: '59', lat: -42.4544, lng: -73.7233, intensidad: 0.6, estado: 'confirmado', radioKm: 1.5, nombre: 'Castro - Dalcahue' },
    { id: '60', lat: -33.1544, lng: -70.6544, intensidad: 0.9, estado: 'confirmado', radioKm: 4.5, nombre: 'Colina - Chicureo Extremo' },
    { id: '61', lat: -33.5544, lng: -71.1233, intensidad: 0.7, estado: 'detectado', radioKm: 1.9, nombre: 'Talagante - Isla de Maipo' },
    { id: '62', lat: -34.1233, lng: -71.1544, intensidad: 0.4, estado: 'bajo_control', radioKm: 1.1, nombre: 'Las Cabras - Lago Rapel Sur' },
    { id: '63', lat: -34.6544, lng: -71.4233, intensidad: 0.85, estado: 'confirmado', radioKm: 3.4, nombre: 'Santa Cruz - Apalta' },
    { id: '64', lat: -35.0233, lng: -72.1233, intensidad: 0.6, estado: 'confirmado', radioKm: 1.8, nombre: 'Hualañé - Mataquito' },
    { id: '65', lat: -35.7544, lng: -71.6544, intensidad: 0.3, estado: 'extinguido', radioKm: 0.5, nombre: 'Colbún - Precordillera' },
    { id: '66', lat: -36.3544, lng: -72.1233, intensidad: 0.9, estado: 'confirmado', radioKm: 5.2, nombre: 'Bulnes - Cruce 5 Sur' },
    { id: '67', lat: -37.1233, lng: -73.1233, intensidad: 0.75, estado: 'detectado', radioKm: 2.4, nombre: 'Coronel - Cordillera de la Costa' },
    { id: '68', lat: -37.4233, lng: -71.7544, intensidad: 0.5, estado: 'bajo_control', radioKm: 1.2, nombre: 'Antuco - Sierra Velluda' },
    { id: '69', lat: -38.1233, lng: -72.6544, intensidad: 0.8, estado: 'confirmado', radioKm: 3.1, nombre: 'Collipulli - Viaducto' },
    { id: '70', lat: -38.9233, lng: -72.6544, intensidad: 0.4, estado: 'detectado', radioKm: 0.9, nombre: 'Freire - Quepe' },
    { id: '71', lat: -31.9544, lng: -71.4233, intensidad: 0.6, estado: 'confirmado', radioKm: 1.4, nombre: 'Los Vilos - Quilimarí' },
    { id: '72', lat: -30.6544, lng: -71.2133, intensidad: 0.7, estado: 'bajo_control', radioKm: 2.1, nombre: 'Ovalle - Limarí' },
    { id: '73', lat: -34.9811, lng: -70.5233, intensidad: 0.4, estado: 'detectado', radioKm: 0.7, nombre: 'Curicó - Los Niches' },
    { id: '74', lat: -36.9544, lng: -72.8233, intensidad: 0.85, estado: 'confirmado', radioKm: 2.8, nombre: 'Tomé - Cuesta Caracoles' },
    { id: '75', lat: -37.6233, lng: -72.2544, intensidad: 0.3, estado: 'extinguido', radioKm: 0.4, nombre: 'Mulchén Forestal' },
    { id: '76', lat: -38.5233, lng: -72.8233, intensidad: 0.65, estado: 'confirmado', radioKm: 1.9, nombre: 'Imperial - Cholchol' },
    { id: '77', lat: -40.5233, lng: -73.5544, intensidad: 0.2, estado: 'falsa_alarma', radioKm: 0.1, nombre: 'San Juan de la Costa' },
    { id: '78', lat: -32.0233, lng: -70.6233, intensidad: 0.9, estado: 'confirmado', radioKm: 2.4, nombre: 'Illapel - Reserva Las Chinchillas' },
    { id: '79', lat: -33.9544, lng: -71.8233, intensidad: 0.7, estado: 'detectado', radioKm: 1.3, nombre: 'Navidad - La Boca' },
    { id: '80', lat: -35.2133, lng: -71.5233, intensidad: 0.5, estado: 'bajo_control', radioKm: 0.9, nombre: 'Río Claro' },
    { id: '82', lat: -33.4500, lng: -70.5500, intensidad: 0.8, estado: 'detectado', radioKm: 1.1, nombre: 'La Reina - Precordillera' },
    { id: '83', lat: -34.3411, lng: -71.2233, intensidad: 0.7, estado: 'confirmado', radioKm: 1.4, nombre: 'Pumanque Sector Centro' },
    { id: '84', lat: -36.7211, lng: -72.6544, intensidad: 0.6, estado: 'bajo_control', radioKm: 0.9, nombre: 'Florida - Cruce Concepción' },
    { id: '85', lat: -37.8922, lng: -72.4133, intensidad: 0.9, estado: 'confirmado', radioKm: 2.3, nombre: 'Traiguén Forestal' }
];

/**
 * Genera datos realistas pero falsos, iterando para encontrar samples válidos y útiles para motivos de visualización. Esto ignora la parte del gráfico que va a hacer uso de la API del backend
 *
 * @param {number} [activityLevel=30] Nivel de actividad para aumentar la ocurrencia. Esto intenta 'sincronizarse' con el backend, para no añadir más fetch
 * por motivos del desafío y simplicidad.
 * @returns {PuntoIncendio[]} Los puntos de incendio resultantes
 */
function generateMockData(activityLevel: number = 30): PuntoIncendio[] {
    // +Actividad, -Umbral
    const threshold = Math.max(0.70, 1 - (activityLevel / 500));

    do {
        const focos = BASE_FOCOS_INCENDIO
            .map(p => ({
                ...p,
                // Se aplican variaciones
                intensidad: Math.min(1, p.intensidad * (0.8 + Math.random() * 0.4)),
                radioKm: p.radioKm * (0.8 + Math.random() * 0.5)
            }))
            .filter(() => Math.random() > threshold) as PuntoIncendio[];

        if (focos.length >= 2) return focos;
    } while (true);
}

export const MOCK_FOCOS = generateMockData();