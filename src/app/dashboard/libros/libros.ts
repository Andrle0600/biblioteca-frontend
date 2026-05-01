import { Component, OnInit } from '@angular/core';
import { LibrosService } from '../../services/libros';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libros.html',
  styleUrl: './libros.scss'
})
export class Libros implements OnInit {
  libros: any[] = [];
  terminoBusqueda: string = '';
  libroEditando: any = null;
  libro = {
    titulo: '',
    autor: '',
    isbn: '',
    editorial: '',
    genero: '',
    fechaPublicacion: '',
    descripcion: '',
    imagenUrl: ''
  };
  submittedEdit = false;

  constructor(private librosService: LibrosService) { }

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.librosService.getLibros().subscribe({
      next: (data) => this.libros = data,
      error: (err) => console.error('Error al cargar libros', err)
    });
  }

  buscarLibros(): void {
    if (this.terminoBusqueda.trim()) {
      this.librosService.buscarLibros(this.terminoBusqueda).subscribe({
        next: (data) => this.libros = data,
        error: (err) => console.error('Error al buscar libros', err)
      });
    } else {
      this.cargarLibros();
    }
  }

  guardarLibro(): void {
    this.librosService.crearLibro(this.libro).subscribe({
      next: () => {
        this.cargarLibros();
        this.resetFormulario();
        const modalElement = document.getElementById('agregarLibro');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      },
      error: (err) => console.error('Error al guardar libro', err)
    });
  }

  resetFormulario(): void {
    this.libro = {
      titulo: '',
      autor: '',
      isbn: '',
      editorial: '',
      genero: '',
      fechaPublicacion: '',
      descripcion: '',
      imagenUrl: ''
    };
  }

  confirmarEliminacion(libroId: number, titulo: string): void {
    if (confirm(`¿Está seguro de que desea eliminar el libro "${titulo}"?`)) {
      this.eliminarLibro(libroId);
    }
  }

  eliminarLibro(id: number): void {
    this.librosService.eliminarLibro(id).subscribe({
      next: () => {
        // Actualizar la lista después de eliminar
        this.cargarLibros();
      },
      error: (err) => {
        console.error('Error al eliminar libro', err);
        alert('No se pudo eliminar el libro');
      }
    });
  }

  abrirModalEditar(libroId: number): void {
    this.submittedEdit = false; // Resetear estado de envío
    this.librosService.getLibro(libroId).subscribe({
      next: (libro) => {
        this.libroEditando = { ...libro };
        // Convertir fecha al formato correcto para el input date
        if (this.libroEditando.fechaPublicacion) {
          this.libroEditando.fechaPublicacion = this.libroEditando.fechaPublicacion.split('T')[0];
        }
        setTimeout(() => {
          const modalElement = document.getElementById(`modalEditar__${libroId}`);
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        });
      },
      error: (err) => console.error('Error al cargar libro', err)
    });
  }

  actualizarLibro(formEditar: NgForm): void {
    this.submittedEdit = true;

    if (formEditar.invalid) {
      return;
    }

    if (!this.libroEditando) return;

    this.librosService.actualizarLibro(this.libroEditando).subscribe({
      next: () => {
        this.cargarLibros();
        this.cerrarModalEditar(this.libroEditando.id);
        this.submittedEdit = false;
      },
      error: (err) => {
        console.error('Error al actualizar libro', err);
        this.submittedEdit = false;
      }
    });
  }


  cerrarModalEditar(libroId: number): void {
    const modalElement = document.getElementById(`modalEditar__${libroId}`);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
    this.libroEditando = null;
  }

}