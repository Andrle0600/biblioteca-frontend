import { Component, OnInit } from '@angular/core';
import { ActividadesService } from '../../services/actividades';
import { ExpositoresService } from '../../services/expositores';
import { Actividad, EstadoActividad, LugarActividad, TipoActividad } from './actividad.model';
import { Expositor } from '../expositores/expositor.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actividades.html',
  styleUrl: './actividades.scss'
})
export class Actividades implements OnInit {
  actividades: Actividad[] = [];
  expositores: Expositor[] = [];

  estados = Object.values(EstadoActividad);
  lugares = Object.values(LugarActividad);
  tipos = Object.values(TipoActividad);

  filtroEstado: string = '';
  filtroTipo: string = '';

  editando: boolean = false;
  actividad: Actividad = this.nuevaActividad();
  expositorId: number | null = null;
  private modalInstance: any = null;

  constructor(
    private actividadesService: ActividadesService,
    private expositoresService: ExpositoresService
  ) {}

  ngOnInit(): void {
    this.cargarActividades();
    this.cargarExpositores();
  }

  cargarActividades(): void {
    const estadoParam = this.filtroEstado ? (this.filtroEstado as EstadoActividad) : undefined;
    const tipoParam = this.filtroTipo ? (this.filtroTipo as TipoActividad) : undefined;

    this.actividadesService.getActividades(estadoParam, tipoParam).subscribe({
      next: (data) => this.actividades = data,
      error: (err) => console.error('Error al cargar actividades', err)
    });
  }

  cargarExpositores(): void {
    this.expositoresService.getExpositores().subscribe({
      next: (data) => {
        // Solo listar expositores habilitados/activos en el select
        this.expositores = data.filter(exp => exp.enabled);
      },
      error: (err) => console.error('Error al cargar expositores', err)
    });
  }

  buscar(): void {
    this.cargarActividades();
  }

  nuevaActividad(): Actividad {
    return {
      nombre: '',
      descripcion: '',
      imagenUrl: '',
      fechaHora: '',
      duracionMinutos: 60,
      capacidad: 30,
      estado: EstadoActividad.ACTIVA,
      lugar: LugarActividad.SALA_LECTURA_A,
      tipoActividad: TipoActividad.CLUB_DE_LECTURA,
      expositor: null
    };
  }

  abrirCrear(): void {
    this.editando = false;
    this.actividad = this.nuevaActividad();
    this.expositorId = null;
    this.mostrarModal();
  }

  abrirEditar(act: Actividad): void {
    this.editando = true;
    this.actividad = { ...act };
    
    // Formatear la fecha para input datetime-local (YYYY-MM-DDTHH:mm)
    if (this.actividad.fechaHora) {
      this.actividad.fechaHora = this.actividad.fechaHora.slice(0, 16);
    }
    
    this.expositorId = act.expositor && act.expositor.id ? act.expositor.id : null;
    this.mostrarModal();
  }

  mostrarModal(): void {
    const modalEl = document.getElementById('modalActividad');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  cerrarModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance = null;
    } else {
      const modalEl = document.getElementById('modalActividad');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
    }
  }

  guardar(): void {
    // Asignar el expositor
    this.actividad.expositor = this.expositorId 
      ? { id: this.expositorId } as Expositor
      : null;

    if (this.editando && this.actividad.id !== undefined) {
      this.actividadesService.actualizarActividad(this.actividad.id, this.actividad).subscribe({
        next: () => {
          this.cargarActividades();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar actividad', err)
      });
    } else {
      this.actividadesService.crearActividad(this.actividad).subscribe({
        next: () => {
          this.cargarActividades();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear actividad', err)
      });
    }
  }

  confirmarCancelar(act: Actividad): void {
    const mensaje = `¿Está seguro de que desea cancelar la actividad "${act.nombre}"?`;
    if (confirm(mensaje)) {
      this.actividadesService.cancelarActividad(act.id!).subscribe({
        next: (data) => {
          act.estado = data.estado;
        },
        error: (err) => {
          console.error('Error al cancelar la actividad', err);
          alert('No se pudo cancelar la actividad.');
        }
      });
    }
  }
}
