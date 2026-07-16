import { Component, OnInit } from '@angular/core';
import { ExpositoresService } from '../../services/expositores';
import { ActividadesService } from '../../services/actividades';
import { Expositor } from './expositor.model';
import { Actividad } from '../actividades/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-expositores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expositores.html',
  styleUrl: './expositores.scss'
})
export class Expositores implements OnInit {
  expositores: Expositor[] = [];
  especialidades: string[] = [];
  actividadesPorExpositor: Map<number, number> = new Map();
  
  terminoNombre: string = '';
  terminoEspecialidad: string = '';

  editando: boolean = false;
  expositor: Expositor = this.nuevoExpositor();
  private modalInstance: any = null;

  constructor(
    private expositoresService: ExpositoresService,
    private actividadesService: ActividadesService
  ) {}

  ngOnInit(): void {
    this.cargarExpositores();
    this.cargarEspecialidades();
    this.cargarConteoActividades();
  }

  cargarExpositores(): void {
    this.expositoresService.getExpositores().subscribe({
      next: (data) => this.expositores = data,
      error: (err) => console.error('Error al cargar expositores', err)
    });
  }

  cargarEspecialidades(): void {
    this.expositoresService.getEspecialidades().subscribe({
      next: (data) => this.especialidades = data,
      error: (err) => console.error('Error al cargar especialidades', err)
    });
  }

  cargarConteoActividades(): void {
    this.actividadesService.getActividades().subscribe({
      next: (actividades: Actividad[]) => {
        this.actividadesPorExpositor = new Map();
        actividades.forEach(act => {
          if (act.expositor?.id !== undefined) {
            const id = act.expositor.id!;
            this.actividadesPorExpositor.set(id, (this.actividadesPorExpositor.get(id) ?? 0) + 1);
          }
        });
      },
      error: (err) => console.error('Error al cargar actividades', err)
    });
  }

  getConteoActividades(expId?: number): number {
    if (expId === undefined) return 0;
    return this.actividadesPorExpositor.get(expId) ?? 0;
  }

  buscar(): void {
    if (this.terminoNombre.trim() || this.terminoEspecialidad) {
      this.expositoresService.filtrarExpositores(this.terminoNombre, this.terminoEspecialidad).subscribe({
        next: (data) => this.expositores = data,
        error: (err) => console.error('Error al filtrar expositores', err)
      });
    } else {
      this.cargarExpositores();
    }
  }

  nuevoExpositor(): Expositor {
    return {
      nombres: '',
      apellidos: '',
      especialidad: '',
      username: '',
      password: '',
      fotoUrl: '',
      bio: '',
      enabled: true
    };
  }

  abrirCrear(): void {
    this.editando = false;
    this.expositor = this.nuevoExpositor();
    this.mostrarModal();
  }

  abrirEditar(exp: Expositor): void {
    this.editando = true;
    this.expositor = { ...exp };
    this.mostrarModal();
  }

  mostrarModal(): void {
    const modalEl = document.getElementById('modalExpositor');
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
      const modalEl = document.getElementById('modalExpositor');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
    }
  }

  guardar(): void {
    if (this.editando && this.expositor.id !== undefined) {
      this.expositoresService.actualizarExpositor(this.expositor.id, this.expositor).subscribe({
        next: () => {
          this.cargarExpositores();
          this.cargarEspecialidades();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar expositor', err)
      });
    } else {
      this.expositoresService.crearExpositor(this.expositor).subscribe({
        next: () => {
          this.cargarExpositores();
          this.cargarEspecialidades();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear expositor', err)
      });
    }
  }

  confirmarCambioEstado(exp: Expositor): void {
    const accion = exp.enabled ? 'desactivar' : 'activar';
    const mensaje = `¿Está seguro de que desea ${accion} al expositor "${exp.nombres} ${exp.apellidos}"?`;
    if (confirm(mensaje)) {
      this.cambiarEstado(exp);
    }
  }

  cambiarEstado(exp: Expositor): void {
    const metodo = exp.enabled
      ? this.expositoresService.desactivarExpositor(exp.id!)
      : this.expositoresService.activarExpositor(exp.id!);

    metodo.subscribe({
      next: () => {
        exp.enabled = !exp.enabled;
      },
      error: (err) => {
        console.error('Error al cambiar el estado del expositor', err);
        alert(`No se pudo cambiar el estado del expositor.`);
      }
    });
  }
}
