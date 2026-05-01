// auth.service.ts (reemplazar/añadir)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { UsuariosService } from './usuarios';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';
  public userSubject = new BehaviorSubject<any>(this.getUsuario());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private usuarioService: UsuariosService) { }

  login(username: string, password: string): Observable<void> {
    return this.http.post<any>(this.apiUrl, { username, password }).pipe(
      tap(response => {
        const token = response.token;
        const user = response.user ?? response;

        if (token) {
          localStorage.setItem('token', token);
        }

        localStorage.setItem('usuario', JSON.stringify(user));
        this.userSubject.next(user);

        // 🔥 Redirección según rol
        if (this.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/cuenta']);
        }
      }),
      map(() => { }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUsuario();
  }

  isAdmin(): boolean {
    const usuario = this.getUsuario();
    if (!usuario || !usuario.roles) return false;
    // roles podría venir como [{id:..., name:"ROLE_ADMIN"}, ...]
    return usuario.roles.some((r: any) => r.name === 'ROLE_ADMIN' || r.name === 'ADMIN');
  }

  actualizarUsuarioConReserva(nuevaReserva: any): void {
    const usuarioActual = this.getUsuario();
    if (usuarioActual) {
      const usuarioActualizado = {
        ...usuarioActual,
        reservas: [...(usuarioActual.reservas || []), nuevaReserva]
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      this.userSubject.next(usuarioActualizado);
    }
  }

  actualizarUsuarioDesdeBackend(): void {
    const usuario = this.getUsuario();
    if (!usuario?.id) return;

    this.usuarioService.getUsuario(usuario.id).subscribe({
      next: (usuarioActualizado) => {
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        this.userSubject.next(usuarioActualizado);
      },
      error: (err) => {
        console.error('Error actualizando usuario desde backend:', err);
      }
    });
  }
}
