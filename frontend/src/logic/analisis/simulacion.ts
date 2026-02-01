/**
 * Motor de simulación climática que genera datos realistas de temperatura,
 * humedad y viento variando según la hora del día y eventos aleatorios.
 */

const horaActual = new Date().getHours();
export const obtenerTemperaturaSimulada = () => {
    const esHoraPicoCalor = horaActual > 11 && horaActual < 19;
    const baseTemperatura = esHoraPicoCalor ? 32 : 22;
    const probabilidadOlaCalor = Math.random() > 0.7;
    const incrementoOlaCalor = probabilidadOlaCalor ? 6 : 0;

    return Math.round(baseTemperatura + (Math.random() * 8) + incrementoOlaCalor);
};

export const obtenerHumedadSimulada = () => {
    const esTardeSeca = horaActual > 12 && horaActual < 20;
    const baseHumedad = esTardeSeca ? 8 : 40;
    const rangoVariacion = esTardeSeca ? 15 : 30;
    const factorSequedad = Math.random() * rangoVariacion;

    return Math.round(Math.max(5, baseHumedad + factorSequedad));
};

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