import { Libro } from "../libros/libro.model";

export interface Ubicacion {
    id: number;
    estante: string;
    posicion: string;
}

export interface Ejemplar {
    id?: number;
    codigoEjemplar: string;
    estado: EstadoEjemplar;
    ubicacion?: Ubicacion | null;
    ubicacionId?: number | null;
    libroId?: number | null;
    libro?: Libro;
}

export enum EstadoEjemplar {
    DISPONIBLE = 'DISPONIBLE',
    RESERVADO = 'RESERVADO',
    PRESTADO = 'PRESTADO',
    EN_REPARACION = 'EN_REPARACION'
}