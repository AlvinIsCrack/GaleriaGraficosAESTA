import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import useViewStore from '../../state/viewStore';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { ANALISIS_DATA } from '../../logic/analisis';
import { useReducedMotion } from 'framer-motion';

export default function GráficoDistribución() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);
    const setFocusedRegion = useViewStore((state) => state.setFocusedRegion);

    const hasAnimated = useRef(false);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (!svgRef.current || !dimensions.width) return;

        const { width, height } = dimensions;

        const margin = {
            top: 30,
            right: 40,
            bottom: 10,
            left: 20
        };

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const y = d3.scaleBand()
            .range([0, chartHeight])
            .domain(ANALISIS_DATA.distribucion.topRegiones.map((d: any) => d.nombre))
            .padding(0.1);

        const x = d3.scaleLinear()
            .range([0, chartWidth])
            .domain([0, d3.max(ANALISIS_DATA.distribucion.topRegiones, (d: any) => d.cantidad as number) || 0]);

        const bars = g.selectAll(".bar")
            .data(ANALISIS_DATA.distribucion.topRegiones)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", (d: any) => y(d.nombre)!)
            .attr("x", 0)
            .attr("height", y.bandwidth())
            .attr("fill", (d: any) => !d.cantidadActivos ? "var(--color-muted-foreground)" : d.cantidadActivos >= 3 ? "var(--color-orange-500)" : "var(--color-amber-500)")
            .attr("rx", 6)
            .attr("opacity", 0.8)
            .style("cursor", "help");

        /** Evitar animación de entrada al ajustar tamaño */
        if (!hasAnimated.current && !reducedMotion)
            bars.attr("width", 0)
                .transition()
                .duration(800)
                .attr("width", (d: any) => x(d.cantidad));
        else bars.attr("width", (d: any) => x(d.cantidad));

        bars
            .on("touchstart", function (event, d: any) {
                event.preventDefault();
                d3.select(this).attr("opacity", 1);
                setFocusedRegion(d.id);
            })
            .on("touchend", function () {
                d3.select(this).attr("opacity", 0.8);
                setFocusedRegion(null);
            })
            .on("mouseenter", function (_event, d: any) {
                d3.select(this).attr("opacity", 1);
                setFocusedRegion(d.id);
            })
            .on("mouseleave", function () {
                d3.select(this).attr("opacity", 0.8);
                setFocusedRegion(null);
            });

        g.append("g")
            .call(d3.axisRight(y).tickSize(0))
            .attr("class", "pointer-events-none font-semibold font-[inherit] text-sm lg:text-base tracking-tighter lg:tracking-tight")
            .style("translate", "4px 0")
            .attr("color", "var(--color-black)")
            .attr("dx", "2px")
            .select(".domain").remove();

        const labels = g.selectAll(".label")
            .data(ANALISIS_DATA.distribucion.topRegiones)
            .enter()
            .append("text")
            .attr("y", (d: any) => y(d.nombre)! + y.bandwidth() / 2 + 5)
            .attr("fill", "var(--color-foreground)")
            .attr("font-size", "14px")
            .attr("font-weight", "700")
            .text((d: any) => d.cantidad);

        /** Evitar animación al ajustar tamaño */
        if (!hasAnimated.current && !reducedMotion)
            labels
                .attr("x", 0)
                .attr("opacity", 0)
                .transition()
                .duration(800)
                .attr("x", (d: any) => x(d.cantidad) + 8)
                .attr("opacity", (d: any) => d.cantidad ? 1 : 0);
        else
            labels
                .attr("x", (d: any) => x(d.cantidad) + 8)
                .attr("opacity", (d: any) => d.cantidad ? 1 : 0);

        hasAnimated.current = true;
    }, [dimensions]);

    return (
        <div ref={containerRef} className="size-full">
            <svg ref={svgRef} width="100%" height="100%" />
        </div>
    );
}