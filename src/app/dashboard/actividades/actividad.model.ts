import { Expositor } from '../expositores/expositor.model';

export enum EstadoActividad {
    ACTIVA = 'ACTIVA',
    CANCELADA = 'CANCELADA',
    FINALIZADA = 'FINALIZADA'
}

export enum LugarActividad {
    SALA_LECTURA_A = 'SALA_LECTURA_A',
    SALA_LECTURA_B = 'SALA_LECTURA_B',
    AUDITORIO = 'AUDITORIO',
    FRONTIS = 'FRONTIS',
    EXTERNO = 'EXTERNO'
}

export enum TipoActividad {
    CLUB_DE_LECTURA = 'CLUB_DE_LECTURA',
    TALLER = 'TALLER',
    CHARLA = 'CHARLA',
    EXPOSICION = 'EXPOSICION',
    CINE = 'CINE',
    ESPECTACULO = 'ESPECTACULO',
    CONCURSO = 'CONCURSO',
    ACTIVIDAD_INFANTIL = 'ACTIVIDAD_INFANTIL',
    VISITA_GUIADA = 'VISITA_GUIADA'
}

export interface Actividad {
    id?: number;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    fechaHora: string;
    duracionMinutos?: number;
    capacidad?: number;
    estado: EstadoActividad;
    lugar: LugarActividad;
    tipoActividad: TipoActividad;
    expositor?: Expositor | null;
}
