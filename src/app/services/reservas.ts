import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, EstadoReserva } from '../dashboard/reservas/reservas.model';
import { Ejemplar } from '../dashboard/ejemplares/ejemplar.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private apiUrl = 'http://localhost:8080/api/reservas';

  constructor(private http: HttpClient) { }

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  crearReserva(reservaData: {
    usuarioId: number;
    ejemplarId: number;
    fechaRecojo: string;
  }): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/crear`, null, {
      params: new HttpParams()
        .set('usuarioId', reservaData.usuarioId.toString())
        .set('ejemplarId', reservaData.ejemplarId.toString())
        .set('fechaRecojo', reservaData.fechaRecojo)
    });
  }

  getReservasPendientes(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/pendientes`);
  }

  getReservasAtrasadas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/atrasadas`);
  }

  getReservasRecientes(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/recientes`)
  }

  getReservaPendientePorCodigo(codigoEjemplar: string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/pendientes/${codigoEjemplar}`);
  }

  actualizarReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${reserva.id}`, reserva);
  }
}
