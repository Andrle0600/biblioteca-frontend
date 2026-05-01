import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../services/reservas';
import { CommonModule } from '@angular/common';
import { Reserva } from '../reservas/reservas.model';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.scss'
})
export class Historial implements OnInit{
  reservas: Reserva[]=[];

  constructor(private reservasService: ReservasService){}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas() :void{
    this.reservasService.getReservas().subscribe({
      next: (data) => this.reservas=data,
      error: (err) => console.error('Error al cargar las reservas',err)
    });
  }
}
