import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string, durationMs = 4000): void {
    this.push('success', message, durationMs);
  }

  error(message: string, durationMs = 5000): void {
    this.push('error', message, durationMs);
  }

  info(message: string, durationMs = 4000): void {
    this.push('info', message, durationMs);
  }

  warning(message: string, durationMs = 4500): void {
    this.push('warning', message, durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(variant: ToastVariant, message: string, durationMs: number): void {
    const toast: Toast = { id: ++nextId, variant, message };
    this._toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }
}
