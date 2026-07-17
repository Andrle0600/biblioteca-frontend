import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { LibrosService } from '../../../services/libros';
import { Libro } from '../../libros/libro.model';
import { Ejemplar, EstadoEjemplar } from '../../ejemplares/ejemplar.model';

/**
 * Tipo local que extiende Ejemplar para tipar el array `reservas` que el
 * endpoint /api/libros embebe en cada ejemplar pero que la interfaz
 * Ejemplar del proyecto no declara (se evita modificar el modelo compartido).
 */
type EjemplarConReservas = Ejemplar & { reservas?: unknown[] };

/**
 * Estados considerados "en circulación":
 *   DISPONIBLE  — ejemplar disponible para préstamo.
 *   RESERVADO   — ejemplar con una reserva activa pendiente de retiro.
 *   PRESTADO    — ejemplar actualmente en manos de un usuario.
 *
 * Estado excluido del conteo de circulación:
 *   EN_REPARACION — ejemplar temporalmente retirado del catálogo para reparación.
 *
 * Si en el futuro se añaden nuevos valores al enum EstadoEjemplar que no
 * figuren en ninguna de las dos categorías anteriores, serán tratados como
 * NO circulantes (mismo criterio que EN_REPARACION) por la lógica del
 * Set `ESTADOS_EN_CIRCULACION`.
 */
const ESTADOS_EN_CIRCULACION = new Set<EstadoEjemplar>([
  EstadoEjemplar.DISPONIBLE,
  EstadoEjemplar.RESERVADO,
  EstadoEjemplar.PRESTADO,
]);

/** Color ARGB de fondo para la fila de encabezados (gris claro). */
const COLOR_ENCABEZADO_ARGB = 'FFD9D9D9';

/** Estilo de fuente para la fila de encabezados. */
const FUENTE_ENCABEZADO: Partial<ExcelJS.Font> = { bold: true };

/** Relleno de fondo para la fila de encabezados. */
const RELLENO_ENCABEZADO: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: COLOR_ENCABEZADO_ARGB },
};

@Injectable({
  providedIn: 'root'
})
export class InventarioLibrosReporteService {

  constructor(private librosService: LibrosService) {}

  /**
   * Genera y descarga en el navegador el reporte de inventario de libros
   * en formato .xlsx con dos hojas: "Libros" y "Ejemplares".
   *
   * El método propaga cualquier error del endpoint directamente sin
   * capturarlo ni mostrar alertas de UI.
   */
  public async generarReporte(): Promise<void> {
    // 1. Obtener todos los libros con sus ejemplares embebidos
    const libros = await firstValueFrom(this.librosService.getLibros());

    // 2. Preparar la fecha para el nombre del archivo y los metadatos
    const ahora = new Date();
    const yyyy = ahora.getFullYear().toString();
    const MM = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const dd = ahora.getDate().toString().padStart(2, '0');
    const fechaArchivo = `${yyyy}${MM}${dd}`; // yyyyMMdd

    // 3. Crear el workbook y fijar metadatos
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Biblioteca';
    workbook.created = ahora;
    workbook.modified = ahora;
    workbook.properties.title = `Inventario de Libros — ${yyyy}-${MM}-${dd}`;

    // 4. Construir Hoja 1 — "Libros"
    this.construirHojaLibros(workbook, libros);

    // 5. Construir Hoja 2 — "Ejemplares"
    this.construirHojaEjemplares(workbook, libros);

    // 6. Generar el buffer y disparar la descarga
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `inventario-libros-${fechaArchivo}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos privados
  // ─────────────────────────────────────────────────────────────────────────

  /** Crea y rellena la hoja "Libros" en el workbook proporcionado. */
  private construirHojaLibros(workbook: ExcelJS.Workbook, libros: Libro[]): void {
    const hoja = workbook.addWorksheet('Libros');

    // Definir columnas (anchos ajustados al contenido esperado)
    hoja.columns = [
      { header: 'Título',                   key: 'titulo',               width: 40 },
      { header: 'Autor',                    key: 'autor',                width: 30 },
      { header: 'Género',                   key: 'genero',               width: 20 },
      { header: 'Editorial',                key: 'editorial',            width: 25 },
      { header: 'ISBN',                     key: 'isbn',                 width: 18 },
      { header: 'Ejemplares totales',       key: 'ejemplaresTotales',    width: 20 },
      { header: 'Ejemplares en circulación',key: 'ejemplaresCirculacion',width: 25 },
      { header: 'Reservas históricas',      key: 'reservasHistoricas',   width: 20 },
    ];

    // Aplicar estilo a la fila de encabezados (fila 1)
    this.aplicarEstiloEncabezado(hoja.getRow(1));

    // Congelar la primera fila para facilitar navegación
    hoja.views = [{ state: 'frozen', ySplit: 1 }];

    // Agregar una fila de datos por cada libro
    for (const libro of libros) {
      const ejemplares = (libro.ejemplares ?? []) as EjemplarConReservas[];

      const ejemplaresTotales = ejemplares.length;
      const ejemplaresCirculacion = this.contarEjemplaresEnCirculacion(ejemplares);
      const reservasHistoricas = this.sumarReservasHistoricas(ejemplares);

      hoja.addRow({
        titulo:               libro.titulo,
        autor:                libro.autor,
        genero:               libro.genero,
        editorial:            libro.editorial,
        isbn:                 libro.isbn,
        ejemplaresTotales,
        ejemplaresCirculacion,
        reservasHistoricas,
      });
    }
  }

  /** Crea y rellena la hoja "Ejemplares" en el workbook proporcionado. */
  private construirHojaEjemplares(workbook: ExcelJS.Workbook, libros: Libro[]): void {
    const hoja = workbook.addWorksheet('Ejemplares');

    // Definir columnas (anchos ajustados al contenido esperado)
    hoja.columns = [
      { header: 'Código de ejemplar', key: 'codigoEjemplar', width: 22 },
      { header: 'Libro',              key: 'libro',           width: 40 },
      { header: 'Estado',             key: 'estado',          width: 18 },
      { header: 'Ubicación',          key: 'ubicacion',       width: 28 },
    ];

    // Aplicar estilo a la fila de encabezados (fila 1)
    this.aplicarEstiloEncabezado(hoja.getRow(1));

    // Congelar la primera fila para facilitar navegación
    hoja.views = [{ state: 'frozen', ySplit: 1 }];

    // Aplanar el array anidado: una fila por cada ejemplar de cada libro
    for (const libro of libros) {
      const ejemplares = (libro.ejemplares ?? []) as EjemplarConReservas[];
      for (const ejemplar of ejemplares) {
        const ubicacion = ejemplar.ubicacion
          ? `${ejemplar.ubicacion.estante} - ${ejemplar.ubicacion.posicion}`
          : null; // celda vacía si ubicacion es null

        hoja.addRow({
          codigoEjemplar: ejemplar.codigoEjemplar,
          libro:          libro.titulo,
          estado:         ejemplar.estado,
          ubicacion,
        });
      }
    }
  }

  /**
   * Aplica a una fila el estilo de encabezado:
   * texto en negrita y fondo gris claro.
   */
  private aplicarEstiloEncabezado(fila: ExcelJS.Row): void {
    fila.font = FUENTE_ENCABEZADO;
    fila.fill = RELLENO_ENCABEZADO;
  }

  /**
   * Cuenta cuántos ejemplares tienen un estado considerado "en circulación".
   * Cualquier estado del enum no incluido en ESTADOS_EN_CIRCULACION
   * (actualmente solo EN_REPARACION, pero también cualquier valor futuro
   * no mapeado) se trata como NO circulante.
   */
  private contarEjemplaresEnCirculacion(ejemplares: EjemplarConReservas[]): number {
    return ejemplares.filter(e => ESTADOS_EN_CIRCULACION.has(e.estado)).length;
  }

  /**
   * Suma el total de reservas históricas de todos los ejemplares de un libro,
   * accediendo al array `reservas` que el endpoint embebe en cada ejemplar.
   */
  private sumarReservasHistoricas(ejemplares: EjemplarConReservas[]): number {
    return ejemplares.reduce((total, e) => total + (e.reservas?.length ?? 0), 0);
  }
}
