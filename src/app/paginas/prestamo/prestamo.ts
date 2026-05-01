import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, RouterModule, NavigationExtras } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LibrosService } from '../../services/libros';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { Subscription } from 'rxjs';
import { Ejemplar } from '../../dashboard/ejemplares/ejemplar.model';
import { ReservasService } from '../../services/reservas';
import { Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
registerLocaleData(localeEs);

@Component({
  selector: 'app-prestamo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './prestamo.html',
  styleUrls: ['./prestamo.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class Prestamo implements OnInit {
  libro: any = null;
  usuario: any = null;
  ejemplar: Ejemplar | null = null;
  fechaRecojo: string = '';
  minDate: string;
  maxDate: string;
  errorMessage: string | null = null;
  private userSubscription!: Subscription;
  isLoading = false;
  reservaSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private librosService: LibrosService,
    private reservaService: ReservasService,
    private router: Router,
    private authService: AuthService
  ) {
    const today = new Date();
    const tomorrow = new Date();
    const twoWeeksLater = new Date();
    tomorrow.setDate(today.getDate() + 1);
    twoWeeksLater.setDate(tomorrow.getDate() + 14);

    this.minDate = this.formatDate(tomorrow);
    this.maxDate = this.formatDate(twoWeeksLater);
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      // Cargar libro
      this.librosService.getDetallePorSlug(slug).subscribe({
        next: (data) => {
          this.libro = data.libro;
          this.cargarEjemplarDisponible(data.ejemplaresDisponibles);
        },
        error: (err) => {
          console.error('Error cargando libro', err);
          this.errorMessage = 'Error al cargar el libro';
        }
      });
      //cargar usuario
      this.userSubscription = this.authService.user$.subscribe({
        next: (user) => {
          if (user) {
            this.usuario = user;
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  enviarReserva(): void {
    if (!this.validarFormulario() || !this.ejemplar?.id) return;

    this.isLoading = true;

    const reservaData = {
      usuarioId: this.usuario.id,
      ejemplarId: this.ejemplar.id,
      fechaRecojo: this.fechaRecojo
    };

    this.reservaService.crearReserva(reservaData).subscribe({
      next: (reserva) => {
        this.reservaSuccess = true;
        this.isLoading = false;

        this.authService.actualizarUsuarioConReserva(reserva);
      },
      error: (err) => {
        console.error('Error creando reserva:', err);
        this.errorMessage = 'Error al crear la reserva';
        this.isLoading = false;
      }
    });
  }

  irAMiCuenta() {
    this.router.navigate(['/cuenta'], {
      state: { reservaReciente: true }
    });
  }

  private validarFormulario(): boolean {
    if (!this.fechaRecojo) {
      alert('Por favor seleccione una fecha de recogida');
      return false;
    }

    const fechaSeleccionada = new Date(this.fechaRecojo);
    const fechaMin = new Date(this.minDate);
    const fechaMax = new Date(this.maxDate);

    if (fechaSeleccionada < fechaMin || fechaSeleccionada > fechaMax) {
      alert('La fecha debe estar dentro del rango permitido');
      return false;
    }

    return true;
  }

  cargarEjemplarDisponible(disponibles: any[]): void {
    if (disponibles.length > 0) {
      this.ejemplar = disponibles[0];
    }
  }

  imprimir(): void {
    window.print();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
