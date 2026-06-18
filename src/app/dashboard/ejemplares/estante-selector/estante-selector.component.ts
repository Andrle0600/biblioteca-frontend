import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ubicacion, Ejemplar } from '../ejemplar.model';

// ───────────────────────────────────────────────────────────────────────────
// Tipos internos del componente
// ───────────────────────────────────────────────────────────────────────────

/** Código de celda, e.g. "1A", "3E" */
type CodigoCelda = string;

/** Estado visual de una celda */
type EstadoCelda = 'disponible' | 'ocupado' | 'seleccionado' | 'inactivo';

interface CeldaEstante {
  codigo: CodigoCelda;    // "1A", "2C", etc.
  estanteNum: number;     // 1-4
  nivel: string;          // A-E
  ubicacion: Ubicacion | null;
  estado: EstadoCelda;
  ejemplaresOcupantes: Ejemplar[];
}

/** Columna de 5 celdas (una por nivel) */
type ColumnaEstante = CeldaEstante[];

// ───────────────────────────────────────────────────────────────────────────
// Constantes de la distribución física
// ───────────────────────────────────────────────────────────────────────────

/** Niveles de abajo (A) hacia arriba (E), pero renderizamos de E a A */
const NIVELES = ['E', 'D', 'C', 'B', 'A'] as const;

/** Límite de ejemplares por celda de estantería */
const LIMITE_CAPACIDAD = 5;

/**
 * Mapeo de código de estantería a los campos que devuelve la API.
 * Buscamos por coincidencia flexible: el campo `estante` de la API
 * debe contener el número (ej. "Estante 1", "1", "Estantería 1", etc.)
 * y el campo `posicion` debe contener el nivel (ej. "A", "Nivel A", etc.)
 */
const ESTANTES_ORDEN = [4, 3, 2, 1] as const; // izquierda → derecha

@Component({
  selector: 'app-estante-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estante-selector.component.html',
  styleUrl: './estante-selector.component.scss'
})
export class EstanteSelectorComponent implements OnChanges {

  // ── Inputs ──────────────────────────────────────────────────────────────

  /** Lista de ubicaciones disponibles obtenidas de la API */
  @Input() ubicaciones: Ubicacion[] = [];

  /** Lista completa de ejemplares (para detectar cuáles están ocupados) */
  @Input() ejemplares: Ejemplar[] = [];

  /** ID de la ubicación seleccionada actualmente (two-way binding) */
  @Input() selectedId: number | null = null;

  /** ID del ejemplar que se está editando (para excluirlo de "ocupado"). Acepta undefined para compatibilidad con el modelo. */
  @Input() ejemplarEditandoId: number | null | undefined = null;

  // ── Outputs ─────────────────────────────────────────────────────────────

  @Output() selectedIdChange = new EventEmitter<number | null>();

  // ── Estado interno ───────────────────────────────────────────────────────

  /** Columnas renderizadas, en orden izquierda → derecha */
  columnas: ColumnaEstante[] = [];

  /** Etiqueta de la celda seleccionada para mostrar en el badge */
  labelSeleccionado: string = '';

  ngOnChanges(_changes: SimpleChanges): void {
    this.construirCuadricula();
  }

  // ── Lógica de construcción ───────────────────────────────────────────────

  private construirCuadricula(): void {
    this.columnas = ESTANTES_ORDEN.map(num => this.construirColumna(num));
    this.actualizarLabelSeleccionado();
  }

  private construirColumna(estanteNum: number): ColumnaEstante {
    return NIVELES.map(nivel => {
      const codigo: CodigoCelda = `${estanteNum}${nivel}`;
      const ubicacion = this.buscarUbicacion(estanteNum, nivel);
      const ejemplaresOcupantes = this.buscarEjemplaresOcupantes(ubicacion);
      const estado = this.calcularEstado(ubicacion, ejemplaresOcupantes);
      return { codigo, estanteNum, nivel, ubicacion, estado, ejemplaresOcupantes };
    });
  }

  /**
   * Localiza la `Ubicacion` de la API que corresponde a este estante y nivel.
   * Estrategia flexible: busca por número en `estante` y letra en `posicion`.
   */
  private buscarUbicacion(estanteNum: number, nivel: string): Ubicacion | null {
    return this.ubicaciones.find(ub => {
      const matchEstante =
        ub.estante === String(estanteNum) ||
        ub.estante.includes(String(estanteNum));
      const matchNivel =
        ub.posicion === nivel ||
        ub.posicion.toUpperCase().includes(nivel);
      return matchEstante && matchNivel;
    }) ?? null;
  }

  /**
   * Devuelve los ejemplares que ocupan esta ubicación,
   * ignorando el ejemplar que se está editando en este momento.
   */
  private buscarEjemplaresOcupantes(ubicacion: Ubicacion | null): Ejemplar[] {
    if (!ubicacion) return [];
    return this.ejemplares.filter(e => {
      if (e.id != null && e.id === this.ejemplarEditandoId) return false;
      return (e.ubicacion?.id ?? e.ubicacionId) === ubicacion.id;
    });
  }

  private calcularEstado(
    ubicacion: Ubicacion | null,
    ocupantes: Ejemplar[]
  ): EstadoCelda {
    if (!ubicacion) return 'inactivo';
    if (ubicacion.id === this.selectedId) return 'seleccionado';
    if (ocupantes.length >= LIMITE_CAPACIDAD) return 'ocupado';
    return 'disponible';
  }

  // ── Interacción ──────────────────────────────────────────────────────────

  seleccionar(celda: CeldaEstante): void {
    if (celda.estado === 'inactivo' || celda.estado === 'ocupado') return;

    const nuevoId = celda.ubicacion?.id ?? null;

    // Deseleccionar si hacemos clic sobre la ya seleccionada
    if (nuevoId === this.selectedId) {
      this.selectedId = null;
      this.selectedIdChange.emit(null);
    } else {
      this.selectedId = nuevoId;
      this.selectedIdChange.emit(nuevoId);
    }

    this.construirCuadricula();
  }

  private actualizarLabelSeleccionado(): void {
    if (this.selectedId == null) {
      this.labelSeleccionado = '';
      return;
    }
    for (const columna of this.columnas) {
      const celda = columna.find(c => c.ubicacion?.id === this.selectedId);
      if (celda) {
        this.labelSeleccionado =
          `Estantería ${celda.estanteNum} — Nivel ${celda.nivel} (${celda.codigo})`;
        return;
      }
    }
    this.labelSeleccionado = '';
  }

  // ── Helpers de plantilla ─────────────────────────────────────────────────

  /** Tooltip detallado para la celda */
  tooltipCelda(celda: CeldaEstante): string {
    if (!celda.ubicacion) return 'Inactivo';
    const total = celda.ejemplaresOcupantes.length;
    let desc = `Ubicación ${celda.codigo} (${total}/${LIMITE_CAPACIDAD} ejemplares)`;
    if (total > 0) {
      desc += '\n\nOcupado por:\n' + celda.ejemplaresOcupantes
        .map(e => `• ${e.codigoEjemplar} - ${e.libro?.titulo || 'Sin título'}`)
        .join('\n');
    }
    return desc;
  }

  /** Indica si la columna pertenece al bloque central (estantes 3 y 2) */
  esCentral(estanteNum: number): boolean {
    return estanteNum === 3 || estanteNum === 2;
  }

  /** Determina si se debe dibujar un pasillo antes de esta columna */
  mostrarPasillo(index: number): boolean {
    // Pasillo entre estante 4 (idx 0) y el bloque central (idx 1)
    // Pasillo entre el bloque central (idx 2) y estante 1 (idx 3)
    return index === 1 || index === 3;
  }
}
