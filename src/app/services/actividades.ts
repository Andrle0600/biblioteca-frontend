import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad, EstadoActividad, TipoActividad } from '../dashboard/actividades/actividad.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private apiUrl = 'http://localhost:8080/api/actividades';

  constructor(private http: HttpClient) {}

  getActividades(estado?: EstadoActividad, tipo?: TipoActividad): Observable<Actividad[]> {
    const params: any = {};
    if (estado) {
      params.estado = estado;
    }
    if (tipo) {
      params.tipo = tipo;
    }
    return this.http.get<Actividad[]>(this.apiUrl, { params });
  }

  getActividad(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.apiUrl}/${id}`);
  }

  crearActividad(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(`${this.apiUrl}/crear`, actividad);
  }

  actualizarActividad(id: number, actividad: Actividad): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/${id}`, actividad);
  }

  cancelarActividad(id: number): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
