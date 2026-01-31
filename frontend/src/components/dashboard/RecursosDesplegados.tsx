import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { ANALISIS_DATA } from '../../logic/analisis';

export default function RecursosDesplegados() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);

    useEffect(() => {
        if (!svgRef.current || !dimensions.width) return;

        const { width, height } = dimensions;
        const radius = Math.min(width, height) / 2 * 0.8;
        const innerRadius = radius * 0.5;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const chartX = width > 300 ? width * 0.35 : width / 2;

        const g = svg.append("g")
            .attr("transform", `translate(${chartX},${height / 2})`);

        const data = ANALISIS_DATA.recursos;
        const totalRecursos = d3.sum(data, d => d.cantidad);

        const pie = d3.pie<typeof data[0]>()
            .value(d => d.cantidad)
            .sort(null)
            .padAngle(0.02);

        const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius(2);

        // Arcos
        g.selectAll("path")
            .data(pie(data))
            .join("path")
            .attr("fill", d => d.data.color)
            .attr("d", arc)
            .transition().duration(1000).attrTween("d", function (d) {
                const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d) || "";
                };
            });

        // Texto centrl
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.1em")
            .attr("class", "text-xl lg:text-3xl font-black tracking-tighter fill-foreground")
            .text(totalRecursos);

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .attr("class", "text-[10px] md:text-xs font-bold uppercase tracking-wide fill-muted-foreground")
            .text("ACTIVOS");

        if (width > 250) {
            const legendG = svg.append("g")
                .attr("transform", `translate(${chartX + radius + 20}, ${height / 2 - (data.length * 25) / 2})`);

            const rows = legendG.selectAll(".legend-row")
                .data(data)
                .enter().append("g")
                .attr("transform", (_d, i) => `translate(0, ${i * 28})`);

            // Indicador de color
            rows.append("circle")
                .attr("r", 4)
                .attr("fill", d => d.color);

            // Cantidad
            rows.append("text")
                .attr("x", 12)
                .attr("y", 4)
                .attr("class", "text-sm font-bold fill-foreground tabular-nums")
                .text(d => d.cantidad);

            // Etiqueta
            rows.append("text")
                .attr("x", 45)
                .attr("y", 4)
                .attr("class", "text-xs font-semibold fill-muted-foreground uppercase tracking-tight")
                .text(d => d.tipo);
        }

    }, [dimensions]);

    return (
        <div ref={containerRef} className="size-full mt-1 lg:mt-2">
            <svg ref={svgRef} width="100%" height="100%" />
        </div>
    );
}