import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../nav-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-700 dark:bg-slate-800"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <div class="flex h-16 items-center justify-center border-b border-slate-200 px-4 dark:border-slate-700">
        @if (collapsed()) {
          <span class="text-xl font-bold text-indigo-600">A</span>
        } @else {
          <span class="text-lg font-bold text-indigo-600">Admin Panel</span>
        }
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        @for (item of items(); track item.label) {
          @if (item.children?.length) {
            <div>
              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                (click)="toggleGroup(item.label)"
              >
                <span class="text-base">{{ item.icon }}</span>
                @if (!collapsed()) {
                  <span class="flex-1 text-left">{{ item.label }}</span>
                  <span class="text-xs transition-transform" [class.rotate-90]="isGroupOpen(item.label)">›</span>
                }
              </button>

              @if (isGroupOpen(item.label) && !collapsed()) {
                <div class="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                  @for (child of item.children; track child.label) {
                    <a
                      [routerLink]="child.route"
                      routerLinkActive="text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-500/10"
                      class="block rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                      {{ child.label }}
                    </a>
                  }
                </div>
              }
            </div>
          } @else {
            <a
              [routerLink]="item.route"
              routerLinkActive="text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-500/10"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <span class="text-base">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  readonly items = input<NavItem[]>([]);
  readonly collapsed = input<boolean>(false);

  private readonly openGroups = signal<ReadonlySet<string>>(new Set());

  protected isGroupOpen(label: string): boolean {
    return this.openGroups().has(label);
  }

  protected toggleGroup(label: string): void {
    const next = new Set(this.openGroups());
    next.has(label) ? next.delete(label) : next.add(label);
    this.openGroups.set(next);
  }
}
