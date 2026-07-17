import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { ReservasService } from '../../../services/reservas';
import { Reserva } from '../../reservas/reservas.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadPrestamosReporteService {

  constructor(private reservasService: ReservasService) { }

  /**
   * Genera y descarga el reporte en formato Excel (.xlsx) de la actividad de préstamos
   * dentro de un rango de fechas.
   * 
   * @param fechaDesde Fecha de inicio
   * @param fechaHasta Fecha de fin
   */
  public async generarReporte(fechaDesde: Date, fechaHasta: Date): Promise<void> {
    // 1. Validar parámetros de entrada
    if (!fechaDesde || !fechaHasta || isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
      throw new Error('Debe especificar un rango de fechas');
    }

    if (fechaDesde > fechaHasta) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    // 2. Consumir el endpoint mediante el service existente.
    // En caso de fallo de red/API, se propaga el error (rechaza la promesa).
    const todasLasReservas = await firstValueFrom(this.reservasService.getReservas());

    // 3. Filtrar los registros en el rango de fechas
    const reservasFiltradas = this.filtrarPorRangoDeFechas(todasLasReservas, fechaDesde, fechaHasta);

    // 4. Crear el workbook de ExcelJS
    const workbook = new ExcelJS.Workbook();
    
    // Asignar metadatos al workbook (opcional pero útil)
    const desdeStr = this.formatDateToYYYYMMDD(fechaDesde);
    const hastaStr = this.formatDateToYYYYMMDD(fechaHasta);
    workbook.title = `Actividad de Préstamos ${desdeStr} - ${hastaStr}`;
    workbook.subject = `Reporte de actividad de préstamos desde ${desdeStr} hasta ${hastaStr}`;
    workbook.creator = 'Sistema de Biblioteca UTP';
    workbook.created = new Date();

    // Crear hoja única
    const sheet = workbook.addWorksheet('Actividad de Préstamos');

    // Congelar la primera fila
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Definir columnas y sus anchos iniciales
    sheet.columns = [
      { header: 'Usuario', key: 'usuario', width: 25 },
      { header: 'Libro', key: 'libro', width: 35 },
      { header: 'Código de ejemplar', key: 'codigoEjemplar', width: 20 },
      { header: 'Fecha de reserva', key: 'fechaReserva', width: 18 },
      { header: 'Fecha estimada de devolución', key: 'fechaEstimadaDevolucion', width: 28 },
      { header: 'Fecha real de devolución', key: 'fechaRealDevolucion', width: 25 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    // Llenar datos de la hoja
    for (const reserva of reservasFiltradas) {
      const nombreUsuario = reserva.user 
        ? `${reserva.user.nombres} ${reserva.user.apellidos}` 
        : '';
      const tituloLibro = reserva.ejemplar?.libro?.titulo || '';
      const codigoEjemplar = reserva.ejemplar?.codigoEjemplar || '';
      const fechaRes = this.formatLocalDate(reserva.fechaReserva);
      const fechaEstDev = this.formatLocalDate(reserva.fechaEstimadaDevolucion);
      const fechaRealDev = reserva.fechaRealDevolucion ? this.formatLocalDate(reserva.fechaRealDevolucion) : '';
      const estado = reserva.estado || '';

      sheet.addRow({
        usuario: nombreUsuario,
        libro: tituloLibro,
        codigoEjemplar: codigoEjemplar,
        fechaReserva: fechaRes,
        fechaEstimadaDevolucion: fechaEstDev,
        fechaRealDevolucion: fechaRealDev,
        estado: estado
      });
    }

    // Estilar fila 1 (Cabecera): Negrita y fondo gris claro #FFD9D9D9
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }
    };

    // Ajustar anchos de columna dinámicamente según contenido
    sheet.columns.forEach((col) => {
      let maxLength = 10;
      if (col.header) {
        maxLength = col.header.length;
      }
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const valStr = cell.value ? String(cell.value) : '';
        if (valStr.length > maxLength) {
          maxLength = valStr.length;
        }
      });
      col.width = maxLength + 4; // Un margen cómodo de padding
    });

    // 5. Generar archivo y descargar en el navegador
    const hoyStr = this.formatDateToYYYYMMDD(new Date());
    const fileName = `actividad-prestamos-${desdeStr}_${hastaStr}-generado-${hoyStr}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Filtra las reservas donde fechaReserva >= desde y fechaReserva <= hasta.
   * Compara únicamente año, mes y día a la medianoche en hora local.
   */
  public filtrarPorRangoDeFechas(reservas: Reserva[], desde: Date, hasta: Date): Reserva[] {
    const startLimit = this.parseLocalMidnight(desde);
    const endLimit = this.parseLocalMidnight(hasta);

    if (!startLimit || !endLimit) {
      return [];
    }

    return reservas.filter(reserva => {
      const resDate = this.parseLocalMidnight(reserva.fechaReserva);
      if (!resDate) {
        return false;
      }
      return resDate >= startLimit && resDate <= endLimit;
    });
  }

  /**
   * Convierte una fecha a formato YYYYMMDD
   */
  private formatDateToYYYYMMDD(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}${m}${d}`;
  }

  /**
   * Parsea un string o Date a un objeto Date local seteado a las 00:00:00.000.
   * Evita distorsiones de zona horaria aislando el año, mes y día de la cadena ISO.
   */
  private parseLocalMidnight(dateInput: Date | string | null | undefined): Date | null {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
      const copy = new Date(dateInput.getTime());
      copy.setHours(0, 0, 0, 0);
      return copy;
    }
    // Si es cadena, tomar los primeros 10 caracteres (yyyy-MM-dd)
    const dateStr = dateInput.substring(0, 10);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day, 0, 0, 0, 0);
      }
    }
    // Fallback
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  /**
   * Formatea una fecha local (Date o cadena ISO) a "dd/MM/yyyy"
   */
  private formatLocalDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '';
    const date = this.parseLocalMidnight(dateInput);
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
