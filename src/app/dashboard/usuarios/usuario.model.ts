export interface Usuario {
    id: number;
    username: string;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono: string;
    direccion?: string;
    genero?: string;
    fechaNacimiento?: string;
    enabled: boolean;
}
