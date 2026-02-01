import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';
import { useResizeObserver } from "../../hooks/useResizeObserver";
import MaterialSymbolsSignalCellularConnectedNoInternet0BarRounded from "../icons/MaterialSymbolsSignalCellularConnectedNoInternet0BarRounded";
import GgSpinner from "../icons/GgSpinner";
import { MOCK_FOCOS } from "../../logic/puntos/focos";
import { motion } from "framer-motion";

/** Dato que devuelve el backend de Python */
type DataPoint = {
    label: string;
    value: number;
    avgValue: number;
    index: number;
};

export default function HistorialFocos() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);

    const [data, setData] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const hasAnimated = useRef(false);

    // Para poder reutilizar y reintentar conxión (UX y debugging)
    const fetchData = (signal?: AbortSignal) => {
        setLoading(true);
        setError(false);

        /** Se maneja el estado de completado, cargando y con error.
         * Para la conexión con cors, se envían credenciales.
         */
        fetch(`http://127.0.0.1:8000/api/chart-data`, { signal, credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error("Error en la petición");
                return res.json();
            })
            .then((resData: DataPoint[]) => {
                resData[resData.length - 1].value = MOCK_FOCOS.length; /** Esto es solo para que 'coincida' la generación del backend con el frontend. Siéntase libre de comentar esta línea por cualquier motivo. La comunicación efectiva entre el backend y el frontend sigue haciéndose. */
                setData(resData);
                setLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Error cargando datos:", err);
                    setError(true);
                    setLoading(false);
                }
            });
    };

    /** Al iniciar */
    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, []);

    /**
     * Efecto principal para el renderizado de la visualización con D3.js.
     * Gestiona la creación de capas SVG, gradientes dinámicos, máscaras de recorte para 
     * animaciones de entrada, y la lógica de interactividad (Tooltip y Focus line).
     * Se sincroniza con el estado global y los cambios de dimensión del contenedor.
     */
    useEffect(() => {
        if (loading || error || !svgRef.current || !dimensions.width || data.length === 0) return;

        const { width, height } = dimensions;
        const margin = { top: 30, right: 10, bottom: 40, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const defs = svg.append("defs");
        const gradientId = "area-gradient-days";
        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");

        gradient.append("stop").attr("offset", "0%").attr("stop-color", "var(--color-amber-500)").attr("stop-opacity", 0.8);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "var(--color-orange-600)").attr("stop-opacity", 0);

        const clipId = "reveal-clip-days";
        const clipRect = defs.append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("width", hasAnimated.current ? width : 0)
            .attr("height", height);

        const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, chartWidth]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 100]).nice().range([chartHeight, 0]);

        const group = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // Label Eje X
        group.append("text")
            .attr("text-anchor", "end")
            .attr("x", chartWidth)
            .attr("y", chartHeight + 40)
            .attr("fill", "var(--color-muted-foreground)")
            .attr("font-size", "11px")
            .text("Tiempo (Días)");

        // Label Eje Y
        group.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", 0)
            .attr("fill", "var(--color-muted-foreground)")
            .attr("font-size", "11px")
            .text("Cantidad de Focos");

        // Cuadrícula X
        group.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(10).tickSize(-chartHeight).tickFormat(() => ""))
            .attr("color", "var(--color-border)").style("opacity", 0.5).select(".domain").remove();

        // Cuadrícula Y
        group.append("g")
            .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(() => ""))
            .attr("color", "var(--color-border)").style("opacity", 0.5).select(".domain").remove();

        // Generadores
        const areaGenerator = d3.area<typeof data[0]>()
            .x(d => x(d.index)).y0(chartHeight).y1(d => y(d.value));

        const lineGenerator = d3.line<typeof data[0]>()
            .x(d => x(d.index)).y(d => y(d.value));

        const avgLineGenerator = d3.line<typeof data[0]>()
            .x(d => x(d.index)).y(d => y(d.avgValue));

        const chartBody = group.append("g").attr("clip-path", `url(#${clipId})`);

        // Datos
        chartBody.append("path").datum(data).attr("d", areaGenerator).attr("fill", `url(#${gradientId})`);
        chartBody.append("path").datum(data).attr("d", lineGenerator).attr("fill", "none").attr("stroke", "var(--color-orange-400)").attr("stroke-width", 2);

        // Promedio de datos
        chartBody.append("path").datum(data).attr("d", avgLineGenerator).attr("fill", "none").attr("stroke", "var(--color-muted-foreground)").attr("stroke-width", 2).attr("stroke-dasharray", "8,4");

        // Interactividad
        const focusLine = group.append("line")
            .attr("y1", 0)
            .attr("y2", chartHeight)
            .attr("stroke", "var(--color-orange-500)")
            .attr("stroke-width", 1)
            .style("opacity", 0);

        const focusCircle = group.append("circle")
            .attr("r", 5)
            .attr("fill", "var(--color-orange-500)")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("opacity", 0);

        const tooltip = d3.select(containerRef.current)
            .append("div")
            .attr("class", "d3-tooltip");

        const overlay = group.append("rect")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("fill", "transparent")
            .style("pointer-events", "all");

        const handleInteraction = (event: any) => {
            const [mouseX] = d3.pointer(event);
            const xIndex = Math.round(x.invert(mouseX));
            const d = data[xIndex];

            if (d) {
                focusLine.attr("x1", x(d.index)).attr("x2", x(d.index)).style("opacity", 1);
                focusCircle.attr("cx", x(d.index)).attr("cy", y(d.value)).style("opacity", 1);

                tooltip
                    .style("visibility", "visible")
                    .html(`<strong>${d.label}</strong><br/>Valor: ${d.value.toFixed(1)}`)
                    .style("top", `${y(d.value) + margin.top - 40}px`)
                    .style("left", `${x(d.index) + margin.left + 10}px`);
            }
        };

        overlay
            .on("mousemove touchmove", handleInteraction)
            .on("click", handleInteraction)
            .on("mouseout touchend", () => {
                focusLine.style("opacity", 0);
                focusCircle.style("opacity", 0);
                tooltip.style("visibility", "hidden");
            });

        // Ticks X
        group.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(6).tickFormat(i => data[i as number]?.label || "").tickSize(5).tickPadding(10))
            .attr("color", "var(--color-muted-foreground)").attr("font-size", "10px").attr("font-family", "monospace")
            .select(".domain").attr("stroke", "var(--color-border)").style("opacity", 0.3);

        // Ticks Y
        group.append("g")
            .call(d3.axisLeft(y).ticks(5).tickSize(10).tickPadding(8))
            .attr("color", "var(--color-muted-foreground)").attr("font-size", "10px").attr("font-family", "monospace")
            .select(".domain").attr("stroke", "var(--color-border)").style("opacity", 0.3);

        // Animación de entrada
        /** Para evitar re-ejecución de animaciones */
        if (!hasAnimated.current) {
            clipRect.transition().duration(2000).ease(d3.easeQuadInOut).attr("width", width);
            hasAnimated.current = true;
        }

        return () => { tooltip.remove(); };
    }, [dimensions, data, loading, error]);

    return (
        <div className="relative flex-1 size-full flex flex-col overflow-hidden">
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: .2 }}
                >
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
                        <GgSpinner className="animate-spin size-8 lg:size-10 text-muted-foreground" />
                    </div>

                </motion.div>
            )}

            {error && (
                <div className="absolute inset-0 z-10 flex flex-col gap-1 items-center justify-center text-xs lg:text-sm text-muted-foreground select-none bg-background">
                    <MaterialSymbolsSignalCellularConnectedNoInternet0BarRounded className="size-6 lg:size-8 opacity-50" />
                    <span className="font-medium">Sin conexión al backend de Python</span>
                    <p
                        onClick={() => fetchData()}
                        className="starting:-translate-y-2 ease-out translate-y-0 transition-[translate] duration-400 cursor-pointer underline text-foreground hover:text-foreground/60"
                    >
                        Reintentar
                    </p>
                </div>
            )}

            <div ref={containerRef} className="flex-1 size-full min-h-0 p-4 touch-none">
                <svg ref={svgRef} width="100%" height="100%" className="overflow-visible" />
            </div>
        </div>
    );
}