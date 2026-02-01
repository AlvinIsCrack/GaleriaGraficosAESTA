import { motion, AnimatePresence } from "framer-motion";
import MotionBlurDigit from "../ui/MotionBlurDigit";
import { useEffect, useRef, useState } from "react";
import { Timer } from "../../helpers/timer";
import { ANALISIS_DATA } from "../../logic/analisis";

import { tv } from "tailwind-variants";

const analisisStyles = tv({
    slots: {
        container: "bottom-0 mt-auto relative",
        heading: "text-6xl @md:text-7xl @lg:text-8xl @xl:text-9xl text-wrap whitespace-pre-wrap -z-10 -ml-1 leading-none font-black tracking-tight",
        sub: "text-muted-foreground -mt-1 z-10 relative text-xs @lg:text-sm uppercase leading-none",
    },
    variants: {
        color: {
            orange: { heading: "text-orange-600", sub: "[&>span]:text-orange-500" },
            rose: { heading: "text-rose-600", sub: "[&>span]:text-rose-500" },
            emerald: { heading: "text-emerald-600 tracking-tighter md:[&.analisis-superficie-heading]:-translate-y-2 @lg:md:[&.analisis-superficie-heading]:-translate-y-4", sub: "[&>span]:text-emerald-500" },
        },
    },
});

const { container, heading, sub } = analisisStyles();

const CIRCUNFERENCIA = 125.6;
const INTERVALO_PESTAÑAS_MS = 6000;

export default function AnalisisSuperficie() {
    const [index, setIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INTERVALO_PESTAÑAS_MS);
    const timerRef = useRef<Timer | null>(null);

    const renderHectareas = () => (
        <div className={container()}>
            <MotionBlurDigit
                value={ANALISIS_DATA.daños.hectáreas}
                from={0}
                className={heading({ color: 'orange' })}
                formatter={(n) => Intl.NumberFormat("es-CL").format(Math.round(n))}
            />
            <p className={sub({ color: 'orange' })}>
                Hectáreas quemadas en
                <span className="font-bold ml-1">
                    {new Date().toLocaleString('es-CL', { month: 'long' })}
                </span>
            </p>
        </div>
    );

    const renderUrbano = () => (
        <div className={container()}>
            <MotionBlurDigit
                value={ANALISIS_DATA.amenazas.población}
                from={0}
                className={heading({ color: 'rose' })}
                formatter={(n) => Intl.NumberFormat("es-CL").format(Math.round(n))}
            />
            <p className={sub({ color: 'rose' })}>
                Personas en áreas de
                <span className="font-bold ml-1">Riesgo Crítico</span>
            </p>
        </div>
    );

    const renderForestal = () => (
        <div className={container()}>
            <MotionBlurDigit
                value={ANALISIS_DATA.amenazas.toneladasBiomasa}
                from={0}
                className={heading({ color: 'emerald', className: 'analisis-superficie-heading' })}
                formatter={(n) => Intl.NumberFormat("es-CL", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                    minimumFractionDigits: 1
                }).format(Math.round(n))}
            />
            <p className={sub({ color: 'emerald' })}>
                Toneladas de Biomasa
                <span className="font-bold ml-1">en Riesgo de Combustión</span>
            </p>
        </div>
    );

    const displays = [renderHectareas, renderUrbano, renderForestal];

    useEffect(() => {
        timerRef.current = new Timer(
            () => setIndex((prev) => (prev + 1) % displays.length),
            INTERVALO_PESTAÑAS_MS,
            (remaining) => setTimeLeft(remaining)
        );

        timerRef.current.start();
        return () => timerRef.current?.destroy();
    }, [displays.length]);

    useEffect(() => {
        setTimeLeft(INTERVALO_PESTAÑAS_MS);
    }, [index]);

    const offset = (timeLeft / INTERVALO_PESTAÑAS_MS) * CIRCUNFERENCIA;
    return <div className='relative size-full overflow-hidden @container'
        onMouseEnter={() => timerRef.current?.pause()}
        onMouseLeave={() => timerRef.current?.start()}
    >
        {/** Fondo */}
        <div
            className="absolute inset-0 -z-10 pointer-events-none bg-grid"
        />

        {/** Display principal: qué pantalla se muestra ahora */}
        <AnimatePresence mode="wait">
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 size-full flex p-2.5 md:p-4 lg:p-6"
            >
                {displays[index]()}
            </motion.div>
        </AnimatePresence>

        {/** Indicador simple inline de progreso */}
        <div className="absolute right-0 top-0 m-2 scale-80 lg:scale-90 xl:scale-100 origin-top-right lg:m-4 xl:m-6 flex items-center gap-2">
            <div className="relative size-12">
                <div className="absolute z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full text-[10px] lg:text-xs font-black text-center -tracking-widest">
                    {index + 1} / {displays.length}
                </div>

                <svg className="size-full overflow-visible -rotate-90 drop-shadow-md/50">
                    <circle
                        cx="24" cy="24" r="20"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted"
                    />

                    {/** Animación del circulo rellenándose */}
                    <motion.circle
                        key={index}
                        cx="24" cy="24" r="20"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={CIRCUNFERENCIA}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                        className="text-muted-foreground"
                    />
                </svg>
            </div>
        </div>
    </div>
}