import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';
import { Timer } from "../../helpers/timer";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { ANALISIS_DATA } from "../../logic/analisis";

const DURACION_REGION_MS = 6000;
export default function GaugeRiesgo() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);

    const [indexRegion, setIndexRegion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(DURACION_REGION_MS);
    const timerRef = useRef<Timer | null>(null);

    useEffect(() => {
        timerRef.current = new Timer(
            () => setIndexRegion((prev) => (prev + 1) % ANALISIS_DATA.clima.length),
            DURACION_REGION_MS,
            (remaining) => setTimeLeft(remaining)
        );
        timerRef.current.start();
        return () => timerRef.current?.destroy();
    }, []);

    useEffect(() => {
        setTimeLeft(DURACION_REGION_MS);
    }, [indexRegion]);

    useEffect(() => {
        if (!svgRef.current || !dimensions.width || !ANALISIS_DATA.clima.length) return;

        const regionActual = ANALISIS_DATA.clima[indexRegion];
        const svg = d3.select(svgRef.current);

        const radius = Math.min(dimensions.width * .48, dimensions.height * .9);
        const innerRadiusBase = radius * 0.5;

        let chartGroup = svg.select<SVGGElement>(".chart-group");
        if (chartGroup.empty())
            chartGroup = svg.append("g").attr("class", "chart-group");

        chartGroup
            .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height + 5})`);

        // Título de la region
        chartGroup.selectAll(".region-label")
            .data([regionActual.region], d => d as string)
            .join(
                enter => enter
                    .append("text")
                    .attr("class", "region-label -translate-y-4 text-xs lg:text-sm font-bold fill-foreground uppercase tracking-tight")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate(0, 10)")
                    .style("opacity", 0)
                    .text(d => d)
                    .call(enter => enter.transition().duration(500)
                        .style("opacity", 1)
                        .attr("transform", "translate(0, 0)")),
                update => update,
                exit => exit
                    .interrupt()
                    .transition().duration(500)
                    .style("opacity", 0)
                    .attr("transform", "translate(0, -10)")
                    .remove()
            );

        const angleScale = d3.scaleLinear()
            .domain([0, 100])
            .range([-Math.PI / 2.5, Math.PI / 2.5]);

        const arcGenerator = d3.arc()
            .innerRadius(innerRadiusBase)
            .outerRadius(radius)
            .padAngle(0.01);

        // semicírculo base
        chartGroup.selectAll(".base-arc")
            .data([1])
            .join("path")
            .attr("class", "base-arc")
            .attr("d", arcGenerator({ startAngle: -Math.PI / 2, endAngle: Math.PI / 2 }) as string)
            .attr("fill", "var(--color-muted)");

        const metricsData = Object.entries(regionActual.metricas).map(([label, metrica], i) => ({
            label,
            metrica,
            i,
            regionId: regionActual.id
        }));

        chartGroup.selectAll<SVGGElement, any>(".metric-group")
            .data(metricsData, d => `${d.regionId}-${d.label}`)
            .join(
                enter => {
                    const groupEnter = enter.append("g")
                        .attr("class", "metric-group")
                        .style("opacity", 0)
                        .attr("transform", "rotate(-60)");

                    groupEnter.transition()
                        .delay(400)
                        .duration(600)
                        .ease(d3.easeBackOut)
                        .style("opacity", 1)
                        .attr("transform", "rotate(0)");

                    return groupEnter;
                },
                update => update,
                exit => exit
                    .interrupt()
                    .transition()
                    .duration(400)
                    .ease(d3.easeBackIn)
                    .style("opacity", 0)
                    .attr("transform", "rotate(60)")
                    .remove()
            )
            .each(function (d) {
                const group = d3.select(this);
                const { i, label, metrica, regionId } = d;

                const startPct = i * 33.33;
                const endPct = (i + 1) * 33.33;
                const midAngleDeg = ((angleScale(startPct) + angleScale(endPct)) / 2) * (180 / Math.PI);

                // Sección arqueada principal
                group.selectAll(".slice-path").data([metrica])
                    .join("path")
                    .attr("class", "slice-path")
                    .attr("d", arcGenerator({
                        startAngle: angleScale(startPct),
                        endAngle: angleScale(endPct)
                    } as any) as string)
                    .attr("fill", m => m.peligro ? "var(--color-red-950)" : "var(--color-neutral-700)");

                // Path invisible para el texto curvo...
                const textPathId = `text-path-${regionId}-${i}`;
                const labelArcGenerator = d3.arc().innerRadius(radius).outerRadius(radius);

                group.selectAll(".def-path").data([metrica]).join("path")
                    .join("path")
                    .attr("class", "def-path")
                    .attr("id", textPathId)
                    .attr("d", labelArcGenerator({
                        startAngle: angleScale(startPct),
                        endAngle: angleScale(endPct)
                    } as any) as string)
                    .attr("fill", "none");

                // Label Curvo
                group.selectAll(".label-text").data([label])
                    .join("text")
                    .attr("class", "label-text")
                    .attr("dy", 15)
                    .selectAll("textPath")
                    .data([label])
                    .join("textPath")
                    .attr("class", "text-[10px] lg:text-xs font-bold uppercase")
                    .attr("fill", metrica.peligro ? "var(--color-red-500)" : "white")
                    .attr("xlink:href", `#${textPathId}`)
                    .attr("startOffset", "25%")
                    .attr("text-anchor", "middle")
                    .text(label);

                // Valor central
                const valueRadius = (radius + innerRadiusBase) / 2 - 10;
                const vTxt = group.selectAll(".value-text").data([metrica]).join("text")
                    .attr("class", "value-text text-xl md:text-3xl lg:text-5xl font-black tracking-tighter tabular-nums")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("transform", `rotate(${midAngleDeg}) translate(0, -${valueRadius})`)
                    .attr("fill", m => m.peligro ? "var(--color-red-500)" : "var(--color-muted-foreground)");

                // Unidad
                vTxt.text(null);
                vTxt.append("tspan").text(metrica.valor);
                vTxt.append("tspan").attr("class", "text-xs lg:text-sm fill-white tracking-tight font-normal! opacity-40 mix-blend-plus-lighter").attr("dx", 4).text(metrica.unidad);
            });
    }, [dimensions, indexRegion]);

    useEffect(() => {
        if (!svgRef.current || !dimensions.width) return;
        /** Esto solo maneja la actualización rápida y constante para el progreso (para que no choque con transiciones de "join") */

        const svg = d3.select(svgRef.current);

        const radius = Math.min(dimensions.width * .48, dimensions.height * .9);
        const innerRadiusBase = radius * 0.5;

        const progressScale = d3.scaleLinear()
            .domain([0, DURACION_REGION_MS])
            .range([Math.PI / 2, -Math.PI / 2]);

        const progressArc = d3.arc()
            .innerRadius(innerRadiusBase - 6)
            .outerRadius(innerRadiusBase)
            .startAngle(-Math.PI / 2)
            .endAngle(progressScale(timeLeft));

        svg.select(".chart-group").selectAll(".timer-progress-arc")
            .data([timeLeft])
            .join("path")
            .attr("class", "timer-progress-arc")
            .attr("d", progressArc as any)
            .attr("fill", "var(--color-muted-foreground)");

    }, [timeLeft, dimensions]);

    return (
        <div ref={containerRef} className="size-full min-h-50 pt-4"
            onMouseEnter={() => timerRef.current?.pause()}
            onMouseLeave={() => timerRef.current?.start()}
        >
            <svg ref={svgRef} width="100%" height="100%" />
        </div>
    );
}