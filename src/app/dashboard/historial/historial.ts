import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Importar servicios de reportes
import { InventarioLibrosReporteService } from './reporte-services/inventario-libros-reporte.service';
import { ActividadPrestamosReporteService } from './reporte-services/actividad-prestamos-reporte.service';
import { GestionAtrasosReporteService } from './reporte-services/gestion-atrasos-reporte.service';

@Component({
  selector: 'app-historial',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.scss'
})
export class Historial implements OnInit {
  filtroForm: FormGroup;
  
  // Estados de carga
  loadingInventario = false;
  loadingActividades = false;
  loadingAtrasos = false;

  // Estados de mensaje (feedback)
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioLibrosReporteService,
    private actividadesService: ActividadPrestamosReporteService,
    private atrasosService: GestionAtrasosReporteService
  ) {
    this.filtroForm = this.fb.group({
      fechaDesde: ['', Validators.required],
      fechaHasta: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {}

  // Validador personalizado para rango de fechas
  dateRangeValidator = (group: AbstractControl): ValidationErrors | null => {
    const desdeVal = group.get('fechaDesde')?.value;
    const hastaVal = group.get('fechaHasta')?.value;

    if (desdeVal && hastaVal) {
      const desde = new Date(desdeVal + 'T00:00:00');
      const hasta = new Date(hastaVal + 'T00:00:00');
      if (desde > hasta) {
        return { 'rangoInvalido': true };
      }
    }
    return null;
  }

  limpiarMensajes(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  async descargarInventario(): Promise<void> {
    this.limpiarMensajes();
    this.loadingInventario = true;
    try {
      await this.inventarioService.generarReporte();
      this.successMessage = 'El reporte de Inventario de Libros se ha generado y descargado con éxito.';
    } catch (error: any) {
      console.error(error);
      this.errorMessage = 'Ocurrió un error al generar el reporte de Inventario de Libros: ' + (error.message || error);
    } finally {
      this.loadingInventario = false;
    }
  }

  async descargarActividades(): Promise<void> {
    if (this.filtroForm.invalid) {
      this.errorMessage = 'Por favor, complete las fechas correctamente antes de generar.';
      return;
    }
    this.limpiarMensajes();
    this.loadingActividades = true;
    try {
      const desdeVal = this.filtroForm.get('fechaDesde')?.value;
      const hastaVal = this.filtroForm.get('fechaHasta')?.value;
      const fechaDesde = new Date(desdeVal + 'T00:00:00');
      const fechaHasta = new Date(hastaVal + 'T00:00:00');
      
      await this.actividadesService.generarReporte(fechaDesde, fechaHasta);
      this.successMessage = 'El reporte de Actividad de Préstamos se ha generado y descargado con éxito.';
    } catch (error: any) {
      console.error(error);
      this.errorMessage = 'Ocurrió un error al generar el reporte de Actividad de Préstamos: ' + (error.message || error);
    } finally {
      this.loadingActividades = false;
    }
  }

  async descargarAtrasos(): Promise<void> {
    this.limpiarMensajes();
    this.loadingAtrasos = true;
    try {
      await this.atrasosService.generarReporte();
      this.successMessage = 'El reporte de Gestión de Atrasos se ha generado y descargado con éxito.';
    } catch (error: any) {
      console.error(error);
      this.errorMessage = 'Ocurrió un error al generar el reporte de Gestión de Atrasos: ' + (error.message || error);
    } finally {
      this.loadingAtrasos = false;
    }
  }
}
