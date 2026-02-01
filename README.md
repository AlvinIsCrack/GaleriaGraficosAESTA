# Desafío Técnico: Galería de Gráficos Responsive - AESTA
<img width="1865" height="988" alt="image" src="https://github.com/user-attachments/assets/b73f0596-de84-4ef9-952b-f0df1d0ffd2c" />

> Por Lucas Enríquez Rivera, estudiante de 3er año de Ing. Civil Informática.

## Descripción
Este repositorio contiene la solución al desafío técnico planteado por **AESTA** (*Asesorías Estratégicas Ambientales*). El proyecto consiste en una aplicación de arquitectura full-stack que integra un `backend` desarrollado en FastAPI y un `frontend` basado en React (Vite + TypeScript), diseñado para la visualización de datos de alta fidelidad y con un enfoque estrictamente responsivo.

Más allá de una implementación estándar, se han aplicado las tecnologías solicitadas mediante **diversos enfoques y configuraciones experimentales**. Se exploraron metodologías avanzadas de estilizado, incluyendo el uso de `tailwind-variants` para la lógica de componentes, PostCSS para el procesamiento de reglas CSS y estilos *inline* estratégicos, con el fin de demostrar **versatilidad técnica, dominio del tooling y adaptabilidad** ante diversos contextos de desarrollo de software.

## Narrativa y Contexto
El repositorio trasciende la funcionalidad de una galería de gráficos convencional al presentarse como un prototipo de **Dashboard de Control de Incidencias Ambientales**. La aplicación utiliza una narrativa de prevención y monitoreo de incendios forestales para demostrar cómo datos estáticos, simulados y en tiempo real pueden converger en una interfaz profesional e interactiva. La cohesión visual se logra mediante una estricta paleta de colores, patrones de espaciado consistentes y una arquitectura de componentes atómicos que unifica la experiencia del usuario.

## Características de Ingeniería
### Backend: Simulación y Procesamiento de Datos
El servidor en **FastAPI** implementa un motor de generación de datos que no se limita a valores aleatorios. Se ha programado, aunque de manera básica:
- **Lógica Estacional:** Los valores fluctúan según variables temporales (meses estivales vs. resto del año).
- **Simulación de Eventos Críticos:** Algoritmos para representar "olas de calor" mediante picos estocásticos de intensidad variable.
- **Pre-procesamiento en Servidor:** Cálculo de **Medias Móviles Centradas** (`avgValue`) para entregar datos procesados listos para su visualización, reduciendo la carga computacional en el cliente.

### Frontend: Visualización y Estado Global
- **Visualización con D3.js:** Implementación de cartografía interactiva utilizando **GeoJSON** para el mapa de Chile y renderizado dinámico de gráficos con ejes escalables.
- **Estado Global con Zustand:** Gestión de filtros, regiones activas y datos mediante un almacén centralizado, evitando el acoplamiento excesivo entre componentes (*prop drilling*).
- **Hooks Personalizados:** Uso de `useResizeObserver` para garantizar que los elementos SVG y los contenedores de D3 se ajusten en tiempo real a los cambios de resolución.

## Stack Tecnológico
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://uvicorn.dev/).
- **Frontend:** React 19, TypeScript, [Vite](https://vite.dev/), [SWC](https://swc.rs/).
- **Estado y Lógica:** [Zustand](https://zustand-demo.pmnd.rs/), Custom Hooks.
- **Visualización:** [D3.js](https://d3js.org/), [Framer Motion](https://motion.dev/) (para transiciones fluidas de datos y animaciones).
- **Estilizado:** [Tailwind CSS](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Tailwind Variants](https://www.tailwind-variants.org/).

## Requisitos Cumplidos
1. **Layout Responsive:** Implementación de un Grid dinámico basado en puntos de interrupción estándar:
   - **Dispositivos Móviles:** 1 columna.
   - **Tabletas:** 2 columnas.
   - **Escritorio:** 3 columnas.
2. **Visualizaciones (6 componentes):** Galería integrada por un gráfico de líneas principal que consume datos del endpoint `/api/chart-data`, complementado por visualizaciones de mapas, análisis de superficie y métricas de recursos desplegados.
3. **Configuración de CORS:** Middleware habilitado en el backend para permitir la comunicación segura con el entorno de desarrollo del frontend.

## Instrucciones de Instalación y Ejecución

### Backend
El endpoint principal genera datos históricos de focos de incendios para dotar de cohesión visual al proyecto.

1. Navegar al directorio `/backend`.
> [!NOTE]
> Se usó un entorno virtual para el desarrollo. Para replicar: `python -m venv venv`.
> Luego, desde la misma consola activar el entorno virtual:
>  - **Windows**: `.\venv\Scripts\activate`
>  - **Mac/Linux**: `source venv/bin/activate`
2. Instalar dependencias: `pip install -r requirements.txt`.
3. Ejecutar el servicio: `python main.py` o `fastapi dev main.py`.

### Frontend
Se aplicaron *media queries* y se experimentó con *container queries* para asegurar que cada visualización mantenga su legibilidad y proporciones.

1. Navegar al directorio `/frontend`.
2. Instalar dependencias: `npm install`.
3. Ejecutar servidor de desarrollo: `npm run dev`.

---
*Iconografía obtenida mediante [Icones](https://icones.js.org/).*

*Archivo GeoJSON extraído de [chile-geojson](https://github.com/caracena/chile-geojson)*
