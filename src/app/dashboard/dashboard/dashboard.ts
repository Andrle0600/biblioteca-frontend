import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios';
import { EjemplaresService } from '../../services/ejemplares';
import { ReservasService } from '../../services/reservas';
import { Usuario } from '../usuarios/usuario.model';
import { Ejemplar } from '../ejemplares/ejemplar.model';
import { Reserva } from '../reservas/reservas.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  usuarios: Usuario[] = [];
  ejemplares: Ejemplar[] = [];
  reservasPendientes: Reserva[] = [];
  reservasAtrasadas: Reserva[] = [];
  reservasRecientes: Reserva[]=[];

  constructor(private usuariosService: UsuariosService,
    private ejemplarresService: EjemplaresService,
    private reservasService: ReservasService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEjemplares();
    this.cargarReservasAtrasadas();
    this.cargarReservasPendientes();
    this.cargarRecientes();
  }
  cargarRecientes() {
    this.reservasService.getReservasRecientes().subscribe({
      next:(data)=> this.reservasRecientes=data,
      error: (err)=> console.error('Error al cargar reservas recientes',err)
    })
  }

  cargarReservasPendientes(): void {
    this.reservasService.getReservasPendientes().subscribe({
      next:(data)=> this.reservasPendientes=data,
      error: (err)=> console.error('Error al cargar reservas pendientes',err)
    })
  }

  cargarReservasAtrasadas(): void {
    this.reservasService.getReservasAtrasadas().subscribe({
      next: (data) => this.reservasAtrasadas = data,
      error: (err) => console.error('Error al cargar reservas atrasadas', err)
    })
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  cargarEjemplares(): void {
    this.ejemplarresService.getEjemplares().subscribe({
      next: (data) => this.ejemplares = data,
      error: (err) => console.error('Error al cargar ejemplares', err)
    });
  }
}
