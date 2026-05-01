import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventos',
  imports: [CommonModule],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss'
})
export class Eventos implements OnInit {

  eventosEspeciales = [
    {
      titulo: '📚 Feria del Libro Municipal 2025',
      descripcion: 'Una semana llena de cultura, libros, autores invitados, actividades para niños y más. ¡No te la pierdas!',
      fecha: 'Del 12 al 19 de julio · Parque Central de Ate',
      imagen: 'https://i.imgur.com/enCfrd9.jpeg'
    }
  ];

  eventos = [
    { titulo: 'Club de Lectura Juvenil', descripcion: 'Espacio para compartir libros e ideas con jóvenes lectores apasionados.', horario: 'Jueves - 4:00 p.m.', imagen: 'https://i.imgur.com/HNjZHxj.jpeg' },
    { titulo: 'Taller de Escritura Creativa', descripcion: 'Aprende a narrar tus propias historias con técnicas literarias modernas.', horario: 'Sábados - 10:00 a.m.', imagen: 'https://i.imgur.com/6L1Pbr8.png' },
    { titulo: 'Cuentacuentos en Familia', descripcion: 'Tardes mágicas de cuentos interactivos y actividades para los más pequeños.', horario: 'Domingos - 3:00 p.m.', imagen: 'https://i.imgur.com/F4svXlJ.png' },
    { titulo: 'Taller de Ilustración Infantil', descripcion: 'Clases de dibujo para niños de 6 a 12 años. Desarrolla su creatividad con arte y color.', horario: 'Viernes - 3:00 p.m.', imagen: 'https://images.unsplash.com/photo-1573164713988-8665fc963095' },
    { titulo: 'Cine Comunitario', descripcion: 'Proyecciones gratuitas de cine peruano y latinoamericano al aire libre.', horario: 'Sábados - 6:30 p.m.', imagen: 'https://i.imgur.com/FjwrSiQ.jpeg' },
    { titulo: 'Charlas de Historia Local', descripcion: 'Descubre el pasado de Ate con relatos y exposiciones.', horario: 'Miércoles - 5:00 p.m.', imagen: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1' },
    { titulo: 'Taller de Teatro Juvenil', descripcion: 'Actuación, expresión corporal y montaje de obras.', horario: 'Martes y jueves - 4:00 p.m.', imagen: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238' },
    { titulo: 'Club de Ajedrez', descripcion: 'Reúne a principiantes y expertos para aprender, practicar y competir.', horario: 'Domingos - 10:00 a.m.', imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' },
    { titulo: 'Encuentro de Poetas', descripcion: 'Lecturas en vivo, micro abierto y presentación de libros.', horario: 'Una vez al mes - 7:00 p.m.', imagen: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2' }
  ];

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

  ngOnInit(): void {
    this.renderCalendar();
  }

  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  renderCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.calendarTitle = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.days = [];

    // Semana
    this.days.push(...['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => ({ day, events: [] })));

    // Vacíos previos
    for (let i = 0; i < firstDay; i++) {
      this.days.push({ day: '', events: [] });
    }

    // Días con eventos
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const events = this.calendarioEventos[dateStr] || [];
      this.days.push({ day: i, events });
    }
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }

}