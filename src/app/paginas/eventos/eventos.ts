import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActividadesService } from '../../services/actividades';
import { Actividad, TipoActividad } from '../../dashboard/actividades/actividad.model';
import { ActividadCard } from './actividad-card';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, ActividadCard],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss'
})
export class Eventos implements OnInit {

  // ── Filtros ──────────────────────────────────────────────────────────────
  tipoSeleccionado: TipoActividad | '' = '';
  fechaDesde = '';
  fechaHasta = '';

  // ── Resultados ───────────────────────────────────────────────────────────
  actividades: Actividad[] = [];
  cargando = false;
  error = false;

  // ── Enum expuesto al template para el dropdown ───────────────────────────
  readonly tiposActividad: { valor: TipoActividad; label: string }[] = [
    { valor: TipoActividad.CLUB_DE_LECTURA,    label: 'Club de Lectura'    },
    { valor: TipoActividad.TALLER,             label: 'Taller'             },
    { valor: TipoActividad.CHARLA,             label: 'Charla'             },
    { valor: TipoActividad.EXPOSICION,         label: 'Exposición'         },
    { valor: TipoActividad.CINE,               label: 'Cine'               },
    { valor: TipoActividad.ESPECTACULO,        label: 'Espectáculo'        },
    { valor: TipoActividad.CONCURSO,           label: 'Concurso'           },
    { valor: TipoActividad.ACTIVIDAD_INFANTIL, label: 'Actividad Infantil' },
    { valor: TipoActividad.VISITA_GUIADA,      label: 'Visita Guiada'      },
  ];

  // ── Calendario ───────────────────────────────────────────────────────────
  calendarioEventos: { [key: string]: string[] } = {
    '2025-04-10': ['Club de Lectura Juvenil'],
    '2025-04-13': ['Cuentacuentos en Familia'],
    '2025-04-20': ['Taller de Escritura Creativa'],
    '2025-07-12': ['Feria del Libro - Inicio'],
    '2025-07-19': ['Feria del Libro - Clausura']
  };

  currentDate: Date = new Date();
  calendarTitle: string = '';
  days: { day: number | string, events: string[] }[] = [];

  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(private actividadesService: ActividadesService) {}

  ngOnInit(): void {
    this.renderCalendar();
    this.buscarActividades();
  }

  // ── Búsqueda contra el API ────────────────────────────────────────────────
  buscarActividades(): void {
    this.cargando = true;
    this.error    = false;

    const tipo  = this.tipoSeleccionado || undefined;
    // El backend espera ISO-8601: yyyy-MM-ddTHH:mm:ss
    const desde = this.fechaDesde ? `${this.fechaDesde}T00:00:00` : undefined;
    const hasta = this.fechaHasta ? `${this.fechaHasta}T23:59:59` : undefined;

    this.actividadesService.getActividadesDisponibles(tipo, desde, hasta).subscribe({
      next: (data) => {
        this.actividades = data;
        this.cargando    = false;
      },
      error: () => {
        this.error    = true;
        this.cargando = false;
      }
    });
  }

  // ── Calendario ───────────────────────────────────────────────────────────
  renderCalendar(): void {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.calendarTitle = `${this.monthNames[month]} ${year}`;

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.days = [];

    // Encabezados de semana
    this.days.push(...['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => ({ day, events: [] })));

    // Celdas vacías previas
    for (let i = 0; i < firstDay; i++) {
      this.days.push({ day: '', events: [] });
    }

    // Días con posibles eventos
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const events  = this.calendarioEventos[dateStr] || [];
      this.days.push({ day: i, events });
    }
  }

  prevMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }
}
