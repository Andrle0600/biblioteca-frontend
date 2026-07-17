import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad, EstadoActividad, TipoActividad } from '../dashboard/actividades/actividad.model';

export interface CuposResponse {
  capacidad: number;
  disponibles: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private apiUrl = 'http://localhost:8080/api/actividades';

  constructor(private http: HttpClient) {}

  // --- Admin ---
  getActividades(estado?: EstadoActividad, tipo?: TipoActividad): Observable<Actividad[]> {
    const params: any = {};
    if (estado) { params.estado = estado; }
    if (tipo)   { params.tipo   = tipo;   }
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

  // --- Catálogo público ---
  // GET /api/actividades/disponibles?tipo=&desde=&hasta=
  getActividadesDisponibles(
    tipo?: TipoActividad,
    desde?: string,
    hasta?: string
  ): Observable<Actividad[]> {
    let params = new HttpParams();
    if (tipo)  { params = params.set('tipo',  tipo);  }
    if (desde) { params = params.set('desde', desde); }
    if (hasta) { params = params.set('hasta', hasta); }
    return this.http.get<Actividad[]>(`${this.apiUrl}/disponibles`, { params });
  }

  // GET /api/actividades/{id}/cupos  → { capacidad, disponibles }
  getCupos(id: number): Observable<CuposResponse> {
    return this.http.get<CuposResponse>(`${this.apiUrl}/${id}/cupos`);
  }
}
