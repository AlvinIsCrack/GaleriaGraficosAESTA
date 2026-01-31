import AnalisisSuperficie from "./dashboard/AnalisisSuperficie";
import GaugeRiesgo from "./dashboard/GaugeRiesgo";
import GráficoDistribución from "./dashboard/GráficoDistribución";
import HistorialFocos from "./dashboard/HistorialFocos";
import IncendioMapa from "./dashboard/IncendioMapa";
import RecursosDesplegados from "./dashboard/RecursosDesplegados";

export default function Dashboard() {
    return <>
        <section id="main-dashboard" aria-label="Dashboard">
            <div id="dashboard-content">
                <div className="lg:row-span-2 min-h-80! lg:min-h-0!">
                    <h2>Historial de Focos</h2>
                    <HistorialFocos />
                </div>
                <div className="min-h-200! md:h-auto md:row-span-2 lg:row-span-3">
                    <h2>Mapa de Incendios</h2>
                    <IncendioMapa />
                </div>
                <div>
                    <h2>Incendios por Región</h2>
                    <GráficoDistribución />
                </div>
                <div>
                    <h2>Análisis de Superficie</h2>
                    <AnalisisSuperficie />
                </div>
                <div>
                    <h2>Factores de Riesgo</h2>
                    <GaugeRiesgo />
                </div>
                <div>
                    <h2>Recursos Desplegados</h2>
                    <RecursosDesplegados />
                </div>
            </div>
        </section>
    </>
}