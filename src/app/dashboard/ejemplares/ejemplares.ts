import { Component, OnInit } from '@angular/core';
import { EjemplaresService } from '../../services/ejemplares';
import { LibrosService } from '../../services/libros';
import { Ejemplar, EstadoEjemplar } from './ejemplar.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ejemplares',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejemplares.html',
  styleUrl: './ejemplares.scss'
})
export class Ejemplares implements OnInit {
  ejemplares: Ejemplar[] = [];
  libros: any[] = [];
  estados = Object.values(EstadoEjemplar);

  // Para el formulario de creación
  nuevoEjemplar: Ejemplar = {
    codigoEjemplar: '',
    estado: EstadoEjemplar.DISPONIBLE,
    ubicacion: '',
    libroId: null
  };

  // Para el formulario de edición
  ejemplarEditando: Ejemplar | null = null;

  // Estados de carga
  cargando = false;
  guardando = false;

  constructor(
    private ejemplaresService: EjemplaresService,
    private librosService: LibrosService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.ejemplaresService.getEjemplares().subscribe({
      next: (data) => {
        this.ejemplares = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ejemplares', err);
        this.cargando = false;
      }
    });

    this.librosService.getLibros().subscribe({
      next: (data) => {
        this.libros = data.sort((a, b) => a.titulo.localeCompare(b.titulo));
      },
      error: (err) => console.error('Error al cargar libros', err)
    });
  }

  abrirModalCrear(modal: any): void {
    this.nuevoEjemplar = {
      codigoEjemplar: '',
      estado: EstadoEjemplar.DISPONIBLE,
      ubicacion: '',
      libroId: null
    };
    this.modalService.open(modal);
  }

  abrirModalEditar(modal: any, ejemplar: Ejemplar): void {
    this.ejemplarEditando = { ...ejemplar };
    this.modalService.open(modal);
  }

  crearEjemplar(): void {
    this.guardando = true;
    this.ejemplaresService.crearEjemplar(this.nuevoEjemplar).subscribe({
      next: () => {
        this.cargarDatos();
        this.modalService.dismissAll();
        this.guardando = false;
        console.log('Datos a enviar:', this.nuevoEjemplar);
      },
      error: (err) => {
        console.error('Error al crear ejemplar', err);
        this.guardando = false;
      }
    });
  }

  actualizarEjemplar(): void {
    if (!this.ejemplarEditando) return;

    this.guardando = true;
    this.ejemplaresService.actualizarEjemplar(this.ejemplarEditando).subscribe({
      next: () => {
        this.cargarDatos();
        this.modalService.dismissAll();
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al actualizar ejemplar', err);
        this.guardando = false;
      }
    });
  }

  confirmarEliminacion(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este ejemplar?')) {
      this.ejemplaresService.eliminarEjemplar(id).subscribe({
        next: () => this.cargarDatos(),
        error: (err) => console.error('Error al eliminar ejemplar', err)
      });
    }
  }

  generarCodigo(): void {
    if (this.nuevoEjemplar.libroId == null) return;

    const libroId = Number(this.nuevoEjemplar.libroId);
    const libro = this.libros.find(lib => lib.id === libroId);

    if (!libro) return;

    const titulo = this.normalizar(libro.titulo);
    const abreviaturaTitulo = this.obtenerAbreviatura(titulo);

    // Filtro mejorado que verifica tanto libroId como el objeto libro
    const ejemplaresDelLibro = this.ejemplares.filter(e => {
      const idComparar = e.libroId !== undefined ? e.libroId : e.libro?.id;
      return idComparar === libro.id;
    });

    console.log('Ejemplares del libro', libro.titulo, ':', ejemplaresDelLibro);

    const numeroCorrelativo = (ejemplaresDelLibro.length + 1).toString().padStart(3, '0');
    const isbn = libro.isbn?.replace(/[^0-9]/g, '') || '00000';
    const isbnSegmento = isbn.slice(-5);

    this.nuevoEjemplar.codigoEjemplar = `${abreviaturaTitulo}-${isbnSegmento}-${numeroCorrelativo}`;
  }

  normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .replace(/^(el|la|los|las)\s+/i, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim();
  }

  obtenerAbreviatura(texto: string): string {
    const palabras = texto.split(/\s+/);
    const abreviatura = palabras.map(p => {
      if (/^\d+$/.test(p)) return p;
      return p[0] || '';
    }).join('').substring(0, 5).toUpperCase();

    return abreviatura;
  }


}
