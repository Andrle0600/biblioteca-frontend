import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private counter = 0;

  private add(message: string, type: Toast['type']): void {
    const id = ++this.counter;
    this.toasts.push({ id, message, type });

    setTimeout(() => this.remove(id), 5000);
  }

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
