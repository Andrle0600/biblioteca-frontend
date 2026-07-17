import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expositor } from '../dashboard/expositores/expositor.model';

@Injectable({
  providedIn: 'root'
})
export class ExpositoresService {
  private apiUrl = 'http://localhost:8080/api/expositores';

  constructor(private http: HttpClient) {}

  getExpositores(): Observable<Expositor[]> {
    return this.http.get<Expositor[]>(this.apiUrl);
  }

  getExpositor(id: number): Observable<Expositor> {
    return this.http.get<Expositor>(`${this.apiUrl}/${id}`);
  }

  crearExpositor(expositor: Expositor): Observable<Expositor> {
    return this.http.post<Expositor>(this.apiUrl, expositor);
  }

  actualizarExpositor(id: number, expositor: Expositor): Observable<Expositor> {
    return this.http.put<Expositor>(`${this.apiUrl}/${id}`, expositor);
  }

  eliminarExpositor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  desactivarExpositor(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  activarExpositor(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/activar`, {});
  }

  getEspecialidades(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/especialidades`);
  }

  filtrarExpositores(nombre?: string, especialidad?: string, orden: string = 'asc'): Observable<Expositor[]> {
    const params: any = { orden };
    if (nombre) {
      params.nombre = nombre;
    }
    if (especialidad) {
      params.especialidad = especialidad;
    }
    return this.http.get<Expositor[]>(`${this.apiUrl}/filtrar`, { params });
  }
}
