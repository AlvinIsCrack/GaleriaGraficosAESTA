import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import useViewStore from '../../state/viewStore';
import { MOCK_FOCOS } from '../../logic/puntos/focos';
import { isIncendioActive } from '../../logic/core/utils';
import { CHILE_GEO_DATA } from '../../logic/geodata/chile';
import MotionBlurDigit from '../ui/MotionBlurDigit';

export default function IncendioMapa() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useResizeObserver(containerRef);
    const focusedRegion = useViewStore((state) => state.focusedRegion);
    const regionsGroupRef = useRef<d3.Selection<SVGPathElement, any, SVGGElement, any> | null>(null);

    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;

        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const tooltip = d3.select(containerRef.current)
            .append("div")
            .attr("class", "d3-tooltip");

        const projection = d3.geoMercator();
        if (MOCK_FOCOS.length > 0) {
            const margin = 100;
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

        regionsGroupRef.current = mapGroup.selectAll("path")
            .data(
                CHILE_GEO_DATA.features.map(region => ({
                    ...region,
                    count: MOCK_FOCOS.filter(foco => isIncendioActive(foco) && d3.geoContains(region, [foco.lng, foco.lat])).length
                }))
            )
            .join(
                enter => enter.append("path")
                    .attr("opacity", 0)
                    .call(enter => enter.transition()
                        .duration(200)
                        .attr("opacity", 1)),
                update => update,
                exit => exit.remove()
            )
            .attr("d", pathGenerator as any)
            .attr("stroke", d => d.count ? "var(--color-orange-700)" : "var(--color-border)")
            .attr("class", "starting:grayscale-100 duration-200 grayscale-0 transition-all")
            .attr("fill", (d) => {
                if (d.count >= 3) return "var(--color-orange-900)";
                if (d.count > 0) return "var(--color-orange-950)";
                return "var(--color-card)";
            })
            .attr("stroke-width", 2)
            .attr("vector-effect", "non-scaling-stroke");

        const focosGroup = svg.append("g").attr("class", "MOCK_FOCOS-layer");

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

        focosGroup.selectAll(".foco-main")
            .data(MOCK_FOCOS.filter(d => isIncendioActive(d)))
            .enter()
            .append("circle")
            .attr("class", "foco-main")
            .attr("cx", d => projection([d.lng, d.lat])![0])
            .attr("cy", d => projection([d.lng, d.lat])![1])
            .attr("fill", d => isIncendioActive(d) ? "var(--color-amber-500)" : "var(--color-muted-foreground)")
            .attr("stroke", "var(--color-border)")
            .attr("r", 0)
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .ease(d3.easeBackOut.overshoot(1.7))
            .attr("r", d => Math.max(d.radioKm, 5))
            .attr("opacity", d => 0.2 + (d.intensidad * 0.8));

        focosGroup.selectAll(".foco-neutralized")
            .data(MOCK_FOCOS.filter(d => !isIncendioActive(d)))
            .enter()
            .append("g")
            .attr("class", "foco-neutralized")
            .attr("transform", d => {
                const [x, y] = projection([d.lng, d.lat])!;
                return `translate(${x}, ${y})`;
            })
            .each(function (d) {
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
            })
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .attr("opacity", 0.7);

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
                overlay.style("cursor", "pointer");

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
            <aside className='absolute right-6 bottom-6 pointer-events-none lg:space-y-1'>
                <div className='text-right'>
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
                <p className='text-sm text-muted-foreground font-bold uppercase'>
                    <span className='text-foreground text-base xl:text-lg mr-0.5'>{MOCK_FOCOS.length}</span> Focos en total
                </p>
            </aside>
        </div>
    );
}