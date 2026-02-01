/**
 * Motor de simulación climática que genera datos realistas de temperatura,
 * humedad y viento variando según la hora del día y eventos aleatorios.
 */

const horaActual = new Date().getHours();

/**
 * Calcula la temperatura simulada considerando ciclos horarios y probabilidad de anomalías térmicas.
 * Se define un pico de calor entre las 11:00 y 19:00 hrs para emular condiciones críticas de riesgo.
 * @returns {number} Temperatura en grados Celsius.
 */
export const obtenerTemperaturaSimulada = () => {
    const esHoraPicoCalor = horaActual > 11 && horaActual < 19;
    const baseTemperatura = esHoraPicoCalor ? 32 : 22;
    const probabilidadOlaCalor = Math.random() > 0.7;
    const incrementoOlaCalor = probabilidadOlaCalor ? 6 : 0;

    return Math.round(baseTemperatura + (Math.random() * 8) + incrementoOlaCalor);
};

/**
 * Genera valores de humedad relativa. En horarios de tarde (12:00-20:00 hrs) se simula 
 * una caída drástica para representar condiciones de sequedad extrema (regla del 30-30-30).
 * @returns {number} Porcentaje de humedad relativa.
 */
export const obtenerHumedadSimulada = () => {
    const esTardeSeca = horaActual > 12 && horaActual < 20;
    const baseHumedad = esTardeSeca ? 8 : 40;
    const rangoVariacion = esTardeSeca ? 15 : 30;
    const factorSequedad = Math.random() * rangoVariacion;

    return Math.round(Math.max(5, baseHumedad + factorSequedad));
};

/**
 * Simula la velocidad del viento. Incluye eventos de "Calma Chicha" y ráfagas tipo "Puelche" 
 * (viento de cordillera seco y cálido) mediante un factor de probabilidad de racha del 20%.
 * @returns {number} Velocidad del viento en km/h.
 */
export const obtenerVientoSimulado = () => {
    const esCalmaChicha = Math.random() < 0.2;
    if (esCalmaChicha) {
        return Math.round(Math.random() * 2);
    }

    const esHoraVientoCostero = horaActual > 15 && horaActual < 21;
    const baseViento = esHoraVientoCostero ? 25 : 5;
    const rachaPuelche = Math.random() > 0.8 ? 25 : 0;

    return Math.round(baseViento + (Math.random() * 20) + rachaPuelche);
};