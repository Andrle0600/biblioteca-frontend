import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FontSize = 'S' | 'M' | 'L';

const STORAGE_KEY = 'accessibility-font-size';
const FONT_CLASSES: Record<FontSize, string> = {
  S: 'font-scale-s',
  M: 'font-scale-m',
  L: 'font-scale-l',
};

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {

  private _currentSize: BehaviorSubject<FontSize>;

  get currentSize$() {
    return this._currentSize.asObservable();
  }

  get currentSize(): FontSize {
    return this._currentSize.getValue();
  }

  constructor() {
    // Leer preferencia guardada o usar 'S' por defecto
    const saved = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    const initial: FontSize = (saved && ['S', 'M', 'L'].includes(saved)) ? saved : 'S';
    this._currentSize = new BehaviorSubject<FontSize>(initial);
    this.applyClass(initial);
  }

  setFontSize(size: FontSize): void {
    if (this._currentSize.getValue() === size) return;
    this._currentSize.next(size);
    localStorage.setItem(STORAGE_KEY, size);
    this.applyClass(size);
  }

  private applyClass(size: FontSize): void {
    const html = document.documentElement;
    // Remover todas las clases de escala anteriores
    Object.values(FONT_CLASSES).forEach(cls => html.classList.remove(cls));
    // Aplicar la clase correspondiente al tamaño seleccionado
    html.classList.add(FONT_CLASSES[size]);
  }
}
