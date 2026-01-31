import { useEffect, useState } from "react";
import { motion, useMotionValue, animate, circOut } from "framer-motion";

interface ProgressTextProps {
    value: number;
    from?: number;
    duration?: number;
    formatter?: (n: number) => string;
    className?: string;
}

/**
 * Componente personalizado para simple estética, que anima desde un inicio en ratio (multiplicación) del valor real, hasta el propio valor, siguiendo una función de suavizado, por un tiempo determinado. Para garantizar granularidad y escalabilidad, se tiene también una propiedad 'formatter' que procesa el texto antes de renderizarlo.
 */
export default function ProgressText({
    value,
    from = 0,
    duration = 0.8,
    formatter = (n) => n.toLocaleString(),
    className,
}: ProgressTextProps) {
    const count = useMotionValue(from * value);
    const [displayValue, setDisplayValue] = useState(formatter(from * value));
    const [prevValue, setPrevValue] = useState(displayValue);
    const [velocity, setVelocity] = useState(0);

    useEffect(() => {
        const controls = animate(count, value, {
            duration: duration,
            ease: circOut,
            onUpdate: (latest) => {
                const v = Math.abs(count.getVelocity());
                setVelocity(v > 5 ? v * 2 : 0);
                const currentFormatted = formatter(latest);
                setPrevValue(displayValue);
                setDisplayValue(currentFormatted);
            },
            onComplete: () => {
                setVelocity(0);
                setPrevValue(displayValue);
            },
        });

        return () => controls.stop();
    }, [value, duration, count]);

    const characters = displayValue.split("");
    const prevCharacters = prevValue.split("");

    return (
        <motion.span className={`inline-flex ${className}`}>
            {characters.map((char, i) => {
                const isNumber = !isNaN(parseInt(char));
                const hasChanged = char !== prevCharacters[i];

                const distanceToRight = characters.length - 1 - i;
                const weight = Math.pow(0.2, distanceToRight);

                const threshold = 10;
                const rawBlur = velocity > threshold ? (velocity * 0.003) * weight : 0;
                const charBlur = Math.min(rawBlur, 18);

                const filterId = `blur-${i}`;

                return (
                    <motion.span
                        key={`${i}-${char}`}
                        initial={isNumber && hasChanged ? { y: "20%", opacity: 0.5 } : {}}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.05 }}
                        className="relative"
                        style={{
                            display: "inline-block",
                            willChange: "transform, filter"
                        }}
                    >
                        <svg className="absolute h-0 w-0">
                            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation={`0 ${charBlur}`} />
                            </filter>
                        </svg>
                        <span style={{
                            filter: isNumber && hasChanged && charBlur > 0.5 ? `url(#${filterId})` : "none"
                        }}>
                            {char}
                        </span>
                    </motion.span>
                );
            })}
        </motion.span>
    );
};