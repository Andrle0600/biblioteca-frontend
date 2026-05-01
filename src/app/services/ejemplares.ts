import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ejemplar, EstadoEjemplar } from '../dashboard/ejemplares/ejemplar.model';

@Injectable({
  providedIn: 'root'
})
export class EjemplaresService {
  private apiUrl = 'http://localhost:8080/api/ejemplares';

  constructor(private http: HttpClient) { }

  getEjemplares(): Observable<Ejemplar[]> {
    return this.http.get<Ejemplar[]>(this.apiUrl);
  }

  getEjemplar(id: number): Observable<Ejemplar> {
    return this.http.get<Ejemplar>(`${this.apiUrl}/${id}`);
  }

  crearEjemplar(ejemplar: Ejemplar): Observable<Ejemplar> {
    // Construye el objeto que espera el backend
    const payload = {
      ...ejemplar,
      libro: ejemplar.libroId ? { id: ejemplar.libroId } : null
    };

    return this.http.post<Ejemplar>(this.apiUrl, payload);
  }

  actualizarEjemplar(ejemplar: Ejemplar): Observable<Ejemplar> {
    return this.http.put<Ejemplar>(`${this.apiUrl}/${ejemplar.id}`, ejemplar);
  }

  eliminarEjemplar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEstados(): EstadoEjemplar[] {
    return Object.values(EstadoEjemplar);
  }
}
