import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actividad-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-5 pt-5 text-center">
      <div class="card p-5 shadow-sm rounded-4 border-0 bg-light">
        <h2 class="text-primary fw-bold mb-3">Detalle de Actividad</h2>
        <p class="fs-4 text-secondary">Detalle de actividad {{ id }}</p>
        <div class="mt-4">
          <a routerLink="/eventos" class="btn btn-outline-primary rounded-pill px-4">
            <i class="bi bi-arrow-left me-2"></i> Volver a Eventos
          </a>
        </div>
      </div>
    </div>
  `
})
export class ActividadDetalle implements OnInit {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
