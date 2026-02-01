import { useState, useEffect, type RefObject } from 'react';

/** Hook personalizado simple, con tal de agilizar el proceso de detectar cambios en las dimensiones del contenedor,
 *  útil para la consideración técnica de que debe ser responsive, y el re-draw por el cambio de tamaño.
 */
export function useResizeObserver(containerRef: RefObject<HTMLElement | null>) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef]);

    return dimensions;
}