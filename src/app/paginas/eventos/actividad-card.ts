import { Component, Input, OnInit, LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs);
import { CommonModule }             from '@angular/common';
import { RouterModule }             from '@angular/router';
import { Actividad, LugarActividad, TipoActividad } from '../../dashboard/actividades/actividad.model';
import { ActividadesService, CuposResponse } from '../../services/actividades';

@Component({
  selector: 'app-actividad-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './actividad-card.html',
  styleUrl: './actividad-card.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class ActividadCard implements OnInit {
  @Input() actividad!: Actividad;

  cupos: CuposResponse | null = null;
  cargandoCupos = true;
  esAlerta = false;
  ocultar = false;

  constructor(private actividadesService: ActividadesService) {}

  ngOnInit(): void {
    if (this.actividad.id == null) {
      this.cargandoCupos = false;
      return;
    }
    this.actividadesService.getCupos(this.actividad.id).subscribe({
      next: (resp) => {
        this.cupos = resp;
        this.cargandoCupos = false;
        if (resp.disponibles <= 0) {
          this.ocultar = true;
          return;
        }
        // Alerta si quedan <= 20 % de la capacidad total
        this.esAlerta = resp.disponibles <= Math.ceil(resp.capacidad * 0.2);
      },
      error: () => {
        this.cargandoCupos = false;
      }
    });
  }

  tipoLabel(tipo: TipoActividad): string {
    const labels: Record<TipoActividad, string> = {
      [TipoActividad.CLUB_DE_LECTURA]:  'Club de Lectura',
      [TipoActividad.TALLER]:           'Taller',
      [TipoActividad.CHARLA]:           'Charla',
      [TipoActividad.EXPOSICION]:       'Exposición',
      [TipoActividad.CINE]:             'Cine',
      [TipoActividad.ESPECTACULO]:      'Espectáculo',
      [TipoActividad.CONCURSO]:         'Concurso',
      [TipoActividad.ACTIVIDAD_INFANTIL]: 'Actividad Infantil',
      [TipoActividad.VISITA_GUIADA]:    'Visita Guiada',
    };
    return labels[tipo] ?? tipo;
  }

  lugarLabel(lugar: LugarActividad): string {
    const labels: Record<LugarActividad, string> = {
      [LugarActividad.SALA_LECTURA_A]: 'Sala de Lectura A',
      [LugarActividad.SALA_LECTURA_B]: 'Sala de Lectura B',
      [LugarActividad.AUDITORIO]:      'Auditorio',
      [LugarActividad.FRONTIS]:        'Frontis',
      [LugarActividad.EXTERNO]:        'Espacio externo',
    };
    return labels[lugar] ?? lugar;
  }
}
