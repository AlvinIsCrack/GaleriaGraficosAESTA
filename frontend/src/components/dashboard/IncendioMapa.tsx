import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import useViewStore from '../../state/viewStore';
import { MOCK_FOCOS } from '../../logic/puntos/focos';
import { isIncendioActive } from '../../logic/core/utils';
import { CHILE_GEO_DATA } from '../../logic/geodata/chile';
import MotionBlurDigit from '../ui/MotionBlurDigit';
import { useReducedMotion } from 'framer-motion';

/**
 * Componente de Visualización Geoespacial.
 * Renderiza un mapa interactivo de Chile utilizando D3.js y GeoJSON.
 * * Características técnicas:
 * - Proyección Mercator ajustada dinámicamente a los puntos de incidencia (MOCK_FOCOS).
 * - Capas de visualización dinámicas: regiones, anillos de pulsación y marcas de control.
 * - Sincronización con el estado global (Zustand) para efectos de resaltado.
 */
export default function IncendioMapa() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);
    const focusedRegion = useViewStore((state) => state.focusedRegion);
    const regionsGroupRef = useRef<d3.Selection<any, any, any, any> | null>(null);

    const hasAnimated = useRef(false);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;

        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const tooltip = d3.select(containerRef.current)
            .append("div")
            .attr("class", "d3-tooltip");

        /**
         * Lógica de Proyección Dinámica:
         * Ajusta el centro y la escala del mapa basándose en la ubicación de los focos.
         * Si hay múltiples focos, usa 'fitExtent' para encuadrar todos los puntos automáticamente.
         */
        const projection = d3.geoMercator();
        if (MOCK_FOCOS.length > 0) {
            /** Para responsividad: buena visibilización en dispositivos móviles */
            const margin = width < 768 ? 50 : 100;

            if (MOCK_FOCOS.length === 1) {
                projection
                    .center([MOCK_FOCOS[0].lng, MOCK_FOCOS[0].lat])
                    .translate([width / 2, height / 2])
                    .scale(Math.min(width, height) * 12);
            } else {
                const pointsGeoJson: any = {
                    type: "FeatureCollection",
                    features: MOCK_FOCOS.map(f => ({
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [f.lng, f.lat] }
                    }))
                };
                projection.fitExtent(
                    [[margin, margin], [width - margin, height - margin]],
                    pointsGeoJson
                );
            }
        } else {
            projection
                .center([-71.0, -35.0])
                .translate([width / 2, height / 2])
                .scale(1000);
        }

        const pathGenerator = d3.geoPath().projection(projection);
        const mapGroup = svg.append("g").attr("class", "map-layer");

        /**
         * Renderizado de Regiones:
         * Procesa el GeoJSON y calcula la densidad de incendios por región en tiempo de ejecución.
         */
        regionsGroupRef.current = mapGroup.selectAll("path")
            .data(
                CHILE_GEO_DATA.features.map(region => ({
                    ...region,
                    count: MOCK_FOCOS.filter(foco => isIncendioActive(foco) && d3.geoContains(region, [foco.lng, foco.lat])).length
                }))
            )
            .join("path")
            .attr("d", pathGenerator as any)
            .attr("stroke", d => d.count ? "var(--color-orange-700)" : "var(--color-border)")
            .attr("class", "duration-200 transition-all")
            .attr("fill", (d) => {
                if (d.count >= 3) return "var(--color-orange-900)";
                if (d.count > 0) return "var(--color-orange-950)";
                return "var(--color-card)";
            })
            .attr("stroke-width", 2)
            .attr("vector-effect", "non-scaling-stroke");

        /* Animación condicional, solo al montar, y si el usuario no tiene prefers-reduced-motion */
        if (!hasAnimated.current && !reducedMotion)
            regionsGroupRef.current
                .attr("opacity", 0)
                .transition()
                .duration(500)
                .attr("opacity", 1);
        else regionsGroupRef.current.attr("opacity", 1);

        const focosGroup = svg.append("g").attr("class", "MOCK_FOCOS-layer");

        // Pulsos de focos activos (animaciones)
        focosGroup.selectAll(".pulse")
            .data(MOCK_FOCOS.filter(d => isIncendioActive(d)))
            .enter()
            .append("circle")
            .attr("class", "pulse")
            .attr("cx", d => projection([d.lng, d.lat])![0])
            .attr("cy", d => projection([d.lng, d.lat])![1])
            .attr("r", d => Math.max(d.radioKm, 5))
            .attr("fill", "var(--color-amber-500)")
            .attr("opacity", 0.4)
            .each(function () {
                const circle = d3.select(this);
                const r = parseFloat(circle.attr("r"));

                function repeat() {
                    circle
                        .transition()
                        .duration(2000)
                        .ease(d3.easeLinear)
                        .attr("r", r * 4)
                        .attr("opacity", 0)
                        .on("end", function () {
                            d3.select(this).attr("r", r).attr("opacity", 0.5);
                            repeat();
                        });
                }
                repeat();
            });

        // Focos principales (Active)
        const focosMain = focosGroup.selectAll(".foco-main")
            .data(MOCK_FOCOS.filter(d => isIncendioActive(d)))
            .enter()
            .append("circle")
            .attr("class", "foco-main")
            .attr("cx", d => projection([d.lng, d.lat])![0])
            .attr("cy", d => projection([d.lng, d.lat])![1])
            .attr("fill", d => isIncendioActive(d) ? "var(--color-amber-500)" : "var(--color-muted-foreground)")
            .attr("stroke", "var(--color-border)");

        if (!hasAnimated.current && !reducedMotion)
            focosMain
                .attr("r", 0)
                .attr("opacity", 0)
                .transition()
                .duration(800)
                .ease(d3.easeBackOut.overshoot(1.7))
                .attr("r", d => Math.max(d.radioKm, 5))
                .attr("opacity", d => 0.2 + (d.intensidad * 0.8));
        else focosMain
            .attr("r", d => Math.max(d.radioKm, 5))
            .attr("opacity", d => 0.2 + (d.intensidad * 0.8));

        // Focos Neutralizados
        const focosNeutral = focosGroup.selectAll(".foco-neutralized")
            .data(MOCK_FOCOS.filter(d => !isIncendioActive(d)))
            .enter()
            .append("g")
            .attr("class", "foco-neutralized")
            .attr("transform", d => {
                const [x, y] = projection([d.lng, d.lat])!;
                return `translate(${x}, ${y})`;
            });

        // Dibujar las líneas X
        focosNeutral.each(function (d) {
            const size = Math.max(d.radioKm, 5);
            const group = d3.select(this);

            group.append("line")
                .attr("x1", -size).attr("y1", -size)
                .attr("x2", size).attr("y2", size)
                .attr("stroke", "var(--color-muted-foreground)")
                .attr("stroke-width", 3)
                .attr("stroke-linecap", "round");
            group.append("line")
                .attr("x1", size).attr("y1", -size)
                .attr("x2", -size).attr("y2", size)
                .attr("stroke", "var(--color-muted-foreground)")
                .attr("stroke-width", 3)
                .attr("stroke-linecap", "round");
        });

        if (!hasAnimated.current && !reducedMotion)
            focosNeutral
                .attr("opacity", 0)
                .transition()
                .duration(800)
                .attr("opacity", 0.7);
        else
            focosNeutral.attr("opacity", 0.7);

        hasAnimated.current = true;

        const overlay = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .style("pointer-events", "all");

        const handleInteraction = (event: any) => {
            const [mouseX, mouseY] = d3.pointer(event);

            const closest = d3.least(MOCK_FOCOS, d => {
                const coords = projection([d.lng, d.lat]);
                if (!coords) return Infinity;
                const dx = coords[0] - mouseX;
                const dy = coords[1] - mouseY;
                return Math.sqrt(dx * dx + dy * dy);
            });

            const coords = closest ? projection([closest.lng, closest.lat]) : null;
            const distance = closest && coords ? Math.hypot(coords[0] - mouseX, coords[1] - mouseY) : Infinity;

            if (closest && coords && distance < 20) {
                overlay.style("cursor", "help");

                tooltip
                    .style("visibility", "visible")
                    .html(`
                        <div class="flex flex-col gap-1">
                            <span class="font-bold text-amber-400">${closest.nombre || 'Foco sin nombre'}</span>
                            <span class="capitalize text-[10px] opacity-80">Estado: ${closest.estado.replace('_', ' ')}</span>
                            <div class="h-1 w-full bg-white/20 rounded-full overflow-hidden mt-1">
                                <div class="h-full bg-amber-500" style="width: ${closest.intensidad * 100}%"></div>
                            </div>
                            <span class="text-[9px] text-right italic">Intensidad: ${(closest.intensidad * 100).toFixed(0)}%</span>
                        </div>
                    `)
                    .style("top", `${coords[1] - 10}px`)
                    .style("left", `${coords[0] + 15}px`)
                    .style("transform", "translateY(-100%)");
            } else {
                overlay.style("cursor", "default");
                tooltip.style("visibility", "hidden");
            }
        };

        overlay
            .on("mousemove touchmove", handleInteraction)
            .on("mouseleave touchend", () => {
                overlay.style("cursor", "default");
                tooltip.style("visibility", "hidden");
            });

        return () => { tooltip.remove(); };
    }, [dimensions]);

    /**
     * Efecto de Reactividad al Estado Global:
     * Aplica filtros de brillo y saturación a las regiones mediante manipulación directa de estilos
     * de D3 para maximizar el rendimiento visual sin re-renderizar todo el SVG.
     */
    useEffect(() => {
        if (!regionsGroupRef.current) return;

        regionsGroupRef.current
            .style("filter", (d: any) => focusedRegion === null ? "" : d.id === focusedRegion ? "brightness(1.5)" : "brightness(0.6)");

    }, [focusedRegion]);

    const activeCount = MOCK_FOCOS.filter(f => isIncendioActive(f)).length;
    return (
        <div ref={containerRef} className="size-full overflow-hidden flex relative items-center justify-center">
            <div
                style={{ '--repeated-bg-size': '12px', '--color-muted': '#fff1' } as any}
                className='absolute inset-0 pointer-events-none select-none bg-polka-dots animate-none!' />

            <svg ref={svgRef} width="100%" height="100%" className='block relative' />
            <aside className='absolute right-6 bottom-6 hover:opacity-40 opacity-80 transition-all lg:space-y-1'>
                <div className='text-right pointer-events-none'>
                    <MotionBlurDigit
                        value={activeCount}
                        from={0}
                        formatter={(n) => Math.round(n).toString()}
                        className='text-amber-500 text-8xl font-black tracking-tighter leading-none -mb-2 tabular-nums'
                    />
                    <div className='text-sm text-amber-500 font-bold uppercase'>
                        Focos Activos
                    </div>
                </div>
                <p className='text-sm text-muted-foreground font-bold uppercase pointer-events-none'>
                    <span className='text-foreground text-base xl:text-lg mr-0.5'>{MOCK_FOCOS.length}</span> Focos en total
                </p>
            </aside>
        </div>
    );
}