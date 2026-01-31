export type EstadoIncendio =
    | 'detectado'
    | 'confirmado'
    | 'bajo_control'
    | 'extinguido'
    | 'falsa_alarma';

export interface PuntoIncendio {
    id: string;
    lat: number;
    lng: number;
    intensidad: number; // de 0.0 a 1.0
    estado: EstadoIncendio;
    radioKm: number;
    nombre?: string;
}