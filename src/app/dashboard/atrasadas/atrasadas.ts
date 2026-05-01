import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../services/reservas';
import { CommonModule } from '@angular/common';
import { Reserva } from '../reservas/reservas.model';

@Component({
  selector: 'app-atrasadas',
  imports: [CommonModule],
  templateUrl: './atrasadas.html',
  styleUrl: './atrasadas.scss'
})
export class Atrasadas implements OnInit {
  reservas: Reserva[] = [];

  constructor(private reservasService: ReservasService) { }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservasService.getReservasAtrasadas().subscribe({
      next: (data) => this.reservas = data,
      error: (err) => console.error('Error al cargar las reservas', err)
    });
  }

  enviarRecordatorio(reserva: any): void {
    const telefono = reserva.user.telefono;
    const tituloLibro = reserva.ejemplar.libro?.titulo ?? 'un libro reservado';
    const mensaje = encodeURIComponent(`Hola ${reserva.user.nombres}, este es un recordatorio para devolver "${tituloLibro}". Por favor, acérquese a la biblioteca lo antes posible.`);

    if (!telefono) {
      alert('Este usuario no tiene un número de teléfono registrado.');
      return;
    }

    const confirmacion = window.confirm(`¿Deseas enviar un recordatorio por WhatsApp a ${reserva.user.nombres} ${reserva.user.apellidos}?`);

    if (confirmacion) {
      const url = `https://wa.me/51929281169?text=${mensaje}`;
      window.open(url, '_blank');
    }
  }

  enviarRecordatorioTodos():void{
    const confirmacion = window.confirm(`¿Deseas enviar un recordatorio por WhatsApp a todos?`);
    if(confirmacion){
      alert("Se envió un recordatorio a todas las reservas atrasadas.")
    }
  }

}
