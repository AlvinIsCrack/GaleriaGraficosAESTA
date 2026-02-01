import { useState, useEffect, type RefObject } from 'react';

/**
 * Hook personalizado para observar cambios en las dimensiones de un elemento del DOM.
 * Es crítico para las visualizaciones con D3.js, ya que permite gatillar el re-renderizado
 * y recalcular escalas y ejes para mantener la integridad del SVG en cualquier resolución.
 * @param {RefObject<HTMLElement | null>} containerRef - Referencia al contenedor padre.
 * @returns {{width: number, height: number}} Dimensiones actuales del contenedor.
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