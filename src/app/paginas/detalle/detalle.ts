import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibrosService } from '../../services/libros';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss'
})
export class Detalle implements OnInit, OnDestroy {
  libro: any = null;
  ejemplares: any[] = [];
  tieneReservaActiva: boolean = false;
  private userSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private librosService: LibrosService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.librosService.getDetallePorSlug(slug).subscribe({
        next: (data) => {
          this.libro = data.libro;
          this.ejemplares = data.ejemplaresDisponibles;
        },
        error: (err) => console.error('Error cargando libro', err)
      });
    }

    this.userSubscription = this.authService.user$.subscribe({
      next: (user) => {
        if (user && user.reservas) {
          this.tieneReservaActiva = user.reservas.some((r: any) => r.fechaRealDevolucion === null);
        } else {
          this.tieneReservaActiva = false;
        }
      },
      error: (err) => console.error('Error cargando usuario en detalle:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  contarDisponibles(): number {
    if (!this.libro) return 0;
    return this.libro.ejemplares
      ?.filter((e: any) => e.estado === 'DISPONIBLE').length ?? 0;
  }

}
