import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs);

@Component({
  selector: 'app-mis-reservas',
  imports: [RouterModule, CommonModule],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class MisReservas implements OnInit {
  usuario: any = null;
  reservas: any[] = [];
  public userSubscription!: Subscription;

  constructor(
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.actualizarUsuarioDesdeBackend(); 
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.userSubscription = this.authService.user$.pipe(
      filter(user => !!user)
    ).subscribe({
      next: (user) => {
        this.usuario = user;
        this.reservas = [...(user.reservas || [])].sort((a, b) =>
          new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime()
        );
      },
      error: (err) => console.error('Error cargando reservas:', err)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
