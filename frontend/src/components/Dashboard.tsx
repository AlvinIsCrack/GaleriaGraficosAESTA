import AnalisisSuperficie from "./dashboard/AnalisisSuperficie";
import GaugeRiesgo from "./dashboard/GaugeRiesgo";
import GráficoDistribución from "./dashboard/GráficoDistribución";
import HistorialFocos from "./dashboard/HistorialFocos";
import IncendioMapa from "./dashboard/IncendioMapa";
import RecursosDesplegados from "./dashboard/RecursosDesplegados";

/**
 * Componente principal del Dashboard.
 * Orquesta la visualización de datos de incendios mediante una grilla de componentes especializados.
 * * Cumple con los requisitos de diseño responsivo del desafío:
 * - Mobile: 1 columna (default)
 * - Tablet: 2 columnas (md:grid-cols-2)
 * - Desktop: 3 columnas (lg:grid-cols-3)
 */
export default function Dashboard() {
    return <>
        <section id="main-dashboard" aria-label="Dashboard">
            <div id="dashboard-content">
                {/* Grafíco 1: Timeline generado por el backend de los ESTE COMPONENTE ES EL QUE SE COMUNICA CON EL BACKEND! */}
                <div className="lg:row-span-2 min-h-80! lg:min-h-0!">
                    <h2>Historial de Focos</h2>
                    <HistorialFocos />
                </div>

                {/* Mapa que usa GeoJson y D3 para renderizar datos geoespaciales simulados */}
                <div className="min-h-200! md:h-auto md:row-span-2 lg:row-span-3">
                    <h2>Mapa de Incendios</h2>
                    <IncendioMapa />
                </div>

                {/* Gráfico de barras con uso de viewStore para interactividad y comunicación entre componentes */}
                <div>
                    <h2>Incendios por Región</h2>
                    <GráficoDistribución />
                </div>

                {/* Métricas de 'big number' alternantes en diferentes pantallas a cada intervalos simples */}
                <div>
                    <h2>Análisis de Superficie</h2>
                    <AnalisisSuperficie />
                </div>

                {/* Gauge variable con animación que utiliza la misma información global de mock para alternar en vistas */}
                <div>
                    <h2>Factores de Riesgo</h2>
                    <GaugeRiesgo />
                </div>

                {/* Gráfico de torta */}
                <div>
                    <h2>Recursos Desplegados</h2>
                    <RecursosDesplegados />
                </div>
            </div>
        </section>
    </>
}