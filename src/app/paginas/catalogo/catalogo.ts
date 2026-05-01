import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LibrosService } from '../../services/libros';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
declare var bootstrap: any;
import { Libro } from '../../dashboard/libros/libro.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.scss']
})
export class Catalogo implements OnInit {
  libros: any[] = [];
  editoriales: string[] = [];
  generos: string[] = [];

  filtroForm!: FormGroup;

  constructor(private fb: FormBuilder, private librosService: LibrosService, private router: Router) { }

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      titulo: [''],
      editorial: [''],
      genero: [''],
      orden: ['asc']
    });

    this.cargarFiltros();
    this.cargarLibros();
  }

  cargarFiltros(): void {
    this.librosService.getEditoriales().subscribe({
      next: (data) => this.editoriales = data,
      error: (err) => console.error('Error cargando editoriales', err)
    });

    this.librosService.getGeneros().subscribe({
      next: (data) => this.generos = data,
      error: (err) => console.error('Error cargando géneros', err)
    });
  }

  cargarLibros(): void {
    this.librosService.getLibros().subscribe({
      next: data => {
        this.libros = this.agregarDisponibles(data);
      },
      error: err => console.error('Error cargando libros', err)
    });
  }

  private agregarDisponibles(libros: any[]) {
    return libros.map(l => ({
      ...l,
      disponibles: l.ejemplares.filter((e: any) => e.estado === 'DISPONIBLE').length
    }));
  }


  filtrar() {
    const { titulo, editorial, genero, orden } = this.filtroForm.value;

    this.librosService.getLibrosFiltrados(titulo, editorial, genero, orden).subscribe(data => {
      // Inicializa con cero disponibles
      this.libros = data.map(libro => ({
        ...libro,
        disponibles: 0 // lo necesitaremos para que no sea undefined al inicio
      }));

      // Cargar ejemplares disponibles para cada libro
      this.libros.forEach(libro => {
        this.librosService.getEjemplaresDisponibles(libro.id).subscribe(ejemplares => {
          libro.disponibles = ejemplares.length; // <- CAMBIO IMPORTANTE
        });
      });
    });
  }

  irADetalle(slug: string, modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
      bsModal.hide();
    }
    setTimeout(() => {
      this.router.navigate(['/detalle', slug]);
    }, 300);
  }

}
