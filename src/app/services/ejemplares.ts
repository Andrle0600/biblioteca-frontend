import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ejemplar, EstadoEjemplar, Ubicacion } from '../dashboard/ejemplares/ejemplar.model';

@Injectable({
  providedIn: 'root'
})
export class EjemplaresService {
  private apiUrl = 'https://api.utpbiblio.dpdns.org/api/ejemplares';
  private ubicacionesUrl = 'https://api.utpbiblio.dpdns.org/api/ubicaciones';

  constructor(private http: HttpClient) { }

  getEjemplares(): Observable<Ejemplar[]> {
    return this.http.get<Ejemplar[]>(this.apiUrl);
  }

  getEjemplar(id: number): Observable<Ejemplar> {
    return this.http.get<Ejemplar>(`${this.apiUrl}/${id}`);
  }

  getUbicaciones(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.ubicacionesUrl);
  }

  crearEjemplar(ejemplar: Ejemplar): Observable<Ejemplar> {
    const payload = {
      codigoEjemplar: ejemplar.codigoEjemplar,
      estado: ejemplar.estado,
      libro: ejemplar.libroId ? { id: ejemplar.libroId } : null,
      ubicacion: ejemplar.ubicacionId ? { id: ejemplar.ubicacionId } : null
    };

    return this.http.post<Ejemplar>(this.apiUrl, payload);
  }

  actualizarEjemplar(ejemplar: Ejemplar): Observable<Ejemplar> {
    const payload = {
      id: ejemplar.id,
      codigoEjemplar: ejemplar.codigoEjemplar,
      estado: ejemplar.estado,
      libro: ejemplar.libro ? { id: ejemplar.libro.id } : (ejemplar.libroId ? { id: ejemplar.libroId } : null),
      ubicacion: ejemplar.ubicacionId ? { id: ejemplar.ubicacionId } : null
    };

    return this.http.put<Ejemplar>(`${this.apiUrl}/${ejemplar.id}`, payload);
  }

  eliminarEjemplar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEstados(): EstadoEjemplar[] {
    return Object.values(EstadoEjemplar);
  }
}
