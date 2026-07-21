import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Breadcrumb" class="flex items-center text-sm text-slate-500 dark:text-slate-400">
      @for (crumb of breadcrumbService.trail(); track crumb.url; let last = $last) {
        @if (!last) {
          <a [routerLink]="crumb.url" class="transition hover:text-slate-900 dark:hover:text-slate-100">
            {{ crumb.label }}
          </a>
          <span class="mx-2 text-slate-300 dark:text-slate-600">/</span>
        } @else {
          <span class="font-medium text-slate-900 dark:text-slate-100">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  protected readonly breadcrumbService = inject(BreadcrumbService);
}
