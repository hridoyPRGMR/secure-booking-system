import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateRangeValue, FilterFieldDef, FilterState } from '../../models/filter.models';

const SEARCH_DEBOUNCE_MS = 350;

@Component({
  selector: 'app-grid-filter',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative w-full lg:max-w-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
        <input
          type="search"
          placeholder="Search…"
          class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          [ngModel]="search()"
          (ngModelChange)="onSearchInput($event)"
        />
      </div>

      <div class="flex flex-1 flex-wrap items-center gap-3">
        @for (field of fields(); track field.key) {
          <div class="flex flex-col gap-1">
            @if (field.type === 'select') {
              <select
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                [ngModel]="stringValue(field.key)"
                (ngModelChange)="onFieldChange(field.key, $event || null)"
              >
                <option value="">{{ field.label }}: All</option>
                @for (opt of field.options; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            } @else if (field.type === 'date-range') {
              <div class="flex items-center gap-1">
                <input
                  type="date"
                  class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  [ngModel]="dateRangeValue(field.key).from"
                  (ngModelChange)="onDateRangeChange(field.key, 'from', $event)"
                />
                <span class="text-slate-400">→</span>
                <input
                  type="date"
                  class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  [ngModel]="dateRangeValue(field.key).to"
                  (ngModelChange)="onDateRangeChange(field.key, 'to', $event)"
                />
              </div>
            } @else {
              <input
                type="text"
                [placeholder]="field.placeholder ?? field.label"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                [ngModel]="stringValue(field.key)"
                (ngModelChange)="onFieldChange(field.key, $event || null)"
              />
            }
          </div>
        }

        @if (hasActiveFilters()) {
          <button
            type="button"
            class="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            (click)="reset()"
          >
            Clear filters ✕
          </button>
        }
      </div>
    </div>
  `,
})
export class GridFilterComponent {
  readonly fields = input<FilterFieldDef[]>([]);
  readonly filtersChanged = output<FilterState>();

  protected readonly search = signal('');
  private readonly values = signal<Record<string, string | DateRangeValue | null>>({});
  private debounceHandle?: ReturnType<typeof setTimeout>;

  protected stringValue(key: string): string {
    const v = this.values()[key];
    return typeof v === 'string' ? v : '';
  }

  protected dateRangeValue(key: string): DateRangeValue {
    const v = this.values()[key];
    return v && typeof v === 'object' ? (v as DateRangeValue) : { from: null, to: null };
  }

  protected hasActiveFilters(): boolean {
    if (this.search().length > 0) return true;
    return Object.values(this.values()).some((v) => {
      if (v == null) return false;
      if (typeof v === 'string') return v.length > 0;
      return Boolean(v.from || v.to);
    });
  }

  protected onSearchInput(value: string): void {
    this.search.set(value);
    clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => this.emit(), SEARCH_DEBOUNCE_MS);
  }

  protected onFieldChange(key: string, value: string | null): void {
    this.values.update((current) => ({ ...current, [key]: value }));
    this.emit();
  }

  protected onDateRangeChange(key: string, edge: 'from' | 'to', value: string): void {
    const current = this.dateRangeValue(key);
    this.values.update((state) => ({ ...state, [key]: { ...current, [edge]: value || null } }));
    this.emit();
  }

  reset(): void {
    clearTimeout(this.debounceHandle);
    this.search.set('');
    this.values.set({});
    this.emit();
  }

  private emit(): void {
    this.filtersChanged.emit({ search: this.search(), values: { ...this.values() } });
  }
}
