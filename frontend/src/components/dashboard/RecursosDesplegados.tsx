import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { ANALISIS_DATA } from '../../logic/analisis';

export default function RecursosDesplegados() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);

    const data = ANALISIS_DATA.recursos;
    const totalRecursos = data.reduce((acc, d) => acc + d.cantidad, 0);

    useEffect(() => {
        if (!svgRef.current || !dimensions.width) return;

        const { width, height } = dimensions;
        const radius = Math.min(width, height) / 2 * 0.8;
        const innerRadius = radius * 0.6;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie<typeof data[0]>()
            .value(d => d.cantidad)
            .sort(null)
            .padAngle(0.02);

        const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius(1);

        // Arcos
        g.selectAll("path")
            .data(pie(data))
            .join("path")
            .attr("class", d => `drop-shadow-sm ${d.data.class}`)
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
            .attr("class", "text-[10px] md:text-xs font-bold uppercase fill-muted-foreground")
            .text("ACTIVOS");
    }, [dimensions, data]);

    return (
        <div ref={containerRef} className="size-full mt-1 lg:mt-2 flex items-center justify-center pb-12 xl:pb-14 lg:pt-2">
            {/** Fondo */}
            <div
                style={{ '--repeated-bg-size': '12px', '--color-muted': '#ffffff08' } as any}
                className='absolute inset-0 pointer-events-none select-none bg-grid' />


            {/** Contenedor principal */}
            <div className="flex-1 size-full min-h-60 z-10 block relative">
                <svg ref={svgRef} width="100%" height="100%" />
            </div>

            {/** Leyenda */}
            <div className="absolute bottom-0 flex flex-row w-full gap-2 xl:gap-4 justify-between xl:justify-center pb-4 px-4 xl:px-10">
                {data.map((item, i) => (
                    <div key={i} className="text-center space-y-1">
                        <p className="text-xs md:text-sm lg:text-base font-black tracking-tight xl:tracking-wide tabular-nums text-foreground leading-none">
                            {item.cantidad}
                        </p>
                        <p className={`text-[8px] lg:text-[10px] xl:text-xs font-semibold lg:font-bold line-clamp-2 uppercase leading-none tracking-tight ${item.class}`}
                        >
                            {item.tipo}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}