import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from '../../../core/services/toast.service';

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  warning: 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 bg-white p-3 shadow-lg dark:bg-slate-800"
          [class]="variantClasses[toast.variant]"
        >
          <span class="text-lg leading-none">{{ variantIcon[toast.variant] }}</span>
          <p class="flex-1 text-sm">{{ toast.message }}</p>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly variantClasses = VARIANT_CLASSES;
  protected readonly variantIcon = VARIANT_ICON;
}
