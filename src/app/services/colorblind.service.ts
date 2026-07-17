import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ColorblindMode = 'none' | 'deuteranomaly' | 'protanomaly' | 'tritanomaly';

const STORAGE_KEY = 'accessibility-colorblind';

@Injectable({
  providedIn: 'root'
})
export class ColorblindService {

  private _currentMode: BehaviorSubject<ColorblindMode>;

  get currentMode$() {
    return this._currentMode.asObservable();
  }

  get currentMode(): ColorblindMode {
    return this._currentMode.getValue();
  }

  constructor() {
    // Leer preferencia guardada o usar 'none' por defecto
    const saved = localStorage.getItem(STORAGE_KEY) as ColorblindMode | null;
    const initial: ColorblindMode = (saved && ['none', 'deuteranomaly', 'protanomaly', 'tritanomaly'].includes(saved)) ? saved : 'none';
    this._currentMode = new BehaviorSubject<ColorblindMode>(initial);

    this.injectSvgFilters();
    this.applyFilter(initial);
  }

  setMode(mode: ColorblindMode): void {
    if (this._currentMode.getValue() === mode) return;
    this._currentMode.next(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    this.applyFilter(mode);
  }

  private injectSvgFilters(): void {
    if (document.getElementById('daltonize-filters')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'daltonize-filters');
    svg.setAttribute('style', 'display: none;');

    // Algoritmo Daltonize: Redistribuye la diferencia de canales que colisionan hacia
    // canales que el usuario si puede discriminar bien.
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Deuteranomaly: Redistribuye diferencia Rojo-Verde hacia Azul
    const deuterFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    deuterFilter.setAttribute('id', 'deuteranomaly');
    const deuterMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    deuterMatrix.setAttribute('type', 'matrix');
    deuterMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0.7 -0.7 1 0 0  0 0 0 1 0');
    deuterFilter.appendChild(deuterMatrix);
    defs.appendChild(deuterFilter);

    // Protanomaly: Redistribuye diferencia Verde-Rojo hacia Azul
    const protaFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    protaFilter.setAttribute('id', 'protanomaly');
    const protaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    protaMatrix.setAttribute('type', 'matrix');
    protaMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  -0.7 0.7 1 0 0  0 0 0 1 0');
    protaFilter.appendChild(protaMatrix);
    defs.appendChild(protaFilter);

    // Tritanomaly: Redistribuye diferencia Azul-Verde hacia Rojo
    const tritaFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    tritaFilter.setAttribute('id', 'tritanomaly');
    const tritaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    tritaMatrix.setAttribute('type', 'matrix');
    tritaMatrix.setAttribute('values', '1 -0.7 0.7 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0');
    tritaFilter.appendChild(tritaMatrix);
    defs.appendChild(tritaFilter);

    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  private applyFilter(mode: ColorblindMode): void {
    const html = document.documentElement;
    if (mode === 'none') {
      html.style.filter = 'none';
    } else {
      html.style.filter = 'url(#' + mode + ')';
    }
  }
}
