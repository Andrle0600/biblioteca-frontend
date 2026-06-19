import { Ejemplar } from '../ejemplares/ejemplar.model';

export interface Libro {
    id?: number;
    titulo: string;
    autor: string;
    isbn: string;
    editorial: string;
    genero: string;
    fechaPublicacion: string;
    descripcion: string;
    imagenUrl: string;
    slug?: string;
    ejemplares?: Ejemplar[];
}