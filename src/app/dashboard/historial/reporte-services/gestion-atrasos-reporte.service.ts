import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFontsModule from 'pdfmake/build/vfs_fonts';
import { ReservasService } from '../../../services/reservas';
import { Reserva } from '../../reservas/reservas.model';

// Configurar fuentes virtuales para que pdfmake funcione en el navegador
const pdfFonts: any = pdfFontsModule;
const fontsVfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts.pdfMake?.vfs || pdfFonts.default;
if (typeof pdfMake.addVirtualFileSystem === 'function') {
  pdfMake.addVirtualFileSystem(fontsVfs);
}

@Injectable({
  providedIn: 'root'
})
export class GestionAtrasosReporteService {

  constructor(
    private reservasService: ReservasService,
    private http: HttpClient
  ) {}

  public async generarReporte(): Promise<void> {
    // 1. Llamar al endpoint /api/reservas/pendientes mediante el service existente
    const reservasPendientes = await firstValueFrom(this.reservasService.getReservasPendientes());
    
    // 2. Filtrar solo las atrasadas
    const atrasadas = this.filtrarAtrasadasPorFechaEstimada(reservasPendientes);

    // Fecha actual formateada
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    // 3. Cargar el logo institucional
    let logoBase64 = '';
    try {
      const blob = await firstValueFrom(
        this.http.get('assets/images/logo-municipalidad.png', { responseType: 'blob' })
      );
      logoBase64 = await this.blobToBase64(blob);
    } catch (error) {
      // TODO: El archivo del logo debe leerse desde src/assets/images/logo-municipalidad.png
      // Si falla, continuamos generando el documento sin el logo.
      console.warn('No se encontró el logo en assets/images/logo-municipalidad.png', error);
    }

    // 4. Armar el contenido de la tabla
    const tableBody: any[][] = [
      [
        { text: 'Nombre completo', bold: true },
        { text: 'Teléfono', bold: true },
        { text: 'Correo', bold: true },
        { text: 'Libro', bold: true },
        { text: 'Código de ejemplar', bold: true },
        { text: 'Fecha estimada de devolución', bold: true },
        { text: 'Contactado', bold: true }
      ]
    ];

    for (const reserva of atrasadas) {
      let fechaEstFormateada = reserva.fechaEstimadaDevolucion;
      if (fechaEstFormateada) {
        // Asumiendo que viene en formato que Date puede parsear, o ya viene formateada.
        const dateObj = new Date(fechaEstFormateada + 'T00:00:00'); // Tratar como hora local evitando timezone offset
        if (!isNaN(dateObj.getTime())) {
          const d = dateObj.getDate().toString().padStart(2, '0');
          const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const y = dateObj.getFullYear();
          fechaEstFormateada = `${d}/${m}/${y}`;
        }
      }

      tableBody.push([
        `${reserva.user?.nombres || ''} ${reserva.user?.apellidos || ''}`.trim(),
        reserva.user?.telefono || '',
        reserva.user?.username || '', // username se asume como correo
        reserva.ejemplar?.libro?.titulo || '',
        reserva.ejemplar?.codigoEjemplar || '',
        fechaEstFormateada || '',
        '' // Casilla para marcar a mano
      ]);
    }

    // 5. Crear el DDO para pdfmake
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape', // Utilizar landscape para que quepan las columnas holgadamente
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          columns: [
            logoBase64 
              ? { image: logoBase64, width: 80, margin: [0, 0, 15, 0] }
              : { text: '', width: 0 },
            {
              text: `Gestión de Atrasos — Corte al ${fechaFormateada}`,
              fontSize: 16,
              bold: true,
              margin: [0, 10, 0, 20]
            }
          ]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 80],
            body: tableBody
          },
          layout: 'lightHorizontalLines'
        }
      ],
      defaultStyle: {
        fontSize: 10
      }
    };

    // 6. Generar y descargar el PDF
    const fileName = `gestion-atrasos-${anio}${mes}${dia}.pdf`;
    (pdfMake as any).createPdf(docDefinition, undefined, undefined, fontsVfs).download(fileName);
  }

  public filtrarAtrasadasPorFechaEstimada(reservas: Reserva[]): Reserva[] {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    return reservas.filter(reserva => {
      if (!reserva.fechaEstimadaDevolucion) return false;
      
      const fechaEstimada = new Date(reserva.fechaEstimadaDevolucion + 'T00:00:00');
      fechaEstimada.setHours(0, 0, 0, 0);

      // Considerar atrasada si la fecha estimada es menor a la fecha actual (solo comparar fecha)
      return fechaEstimada.getTime() < fechaActual.getTime();
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
