import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  CellContext,
  ColumnDef,
  DEFAULT_PAGE_SIZES,
  RowAction,
  SortOrder,
} from '../../models/grid.models';

export interface RowActionEvent<T> {
  action: string;
  item: T;
}

/**
 * Generic, type-safe admin data table.
 *
 * Two modes, both driven by the same signal-based API:
 *  - `serverSide=false` (default): pass the *full* dataset via `data`; the grid
 *    sorts/paginates it internally — fine for small admin lists.
 *  - `serverSide=true`: pass just the *current page* via `data` (e.g. straight from an
 *    `httpResource().value()`) plus `total`. The grid renders it as-is and only exposes
 *    `page`/`pageSize`/`sortBy`/`sortOrder` as models for the parent to react to
 *    (e.g. inside the `httpResource` request factory) and refetch.
 */
@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-grid.component.html',
})
export class DataGridComponent<T> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly rowActions = input<RowAction<T>[]>([]);
  readonly trackBy = input.required<(row: T) => string>();
  readonly isLoading = input<boolean>(false);
  readonly selectable = input<boolean>(false);
  readonly serverSide = input<boolean>(false);
  readonly total = input<number>(0);
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZES);
  readonly emptyMessage = input<string>('No records found.');

  readonly page = model<number>(1);
  readonly pageSize = model<number>(10);
  readonly sortBy = model<string>('');
  readonly sortOrder = model<SortOrder>('asc');
  readonly selectedIds = model<ReadonlySet<string>>(new Set());

  readonly actionTriggered = output<RowActionEvent<T>>();

  protected readonly openMenuRowId = signal<string | null>(null);

  private readonly sortedClientData = computed(() => {
    if (this.serverSide()) return this.data();
    const rows = [...this.data()];
    const key = this.sortBy();
    if (!key) return rows;

    const col = this.columns().find((c) => (c.sortKey ?? c.key) === key);
    const accessor = col?.accessor ?? ((row: T) => (row as Record<string, unknown>)[key]);
    const order = this.sortOrder() === 'asc' ? 1 : -1;

    return rows.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * order;
      if (bv == null) return 1 * order;
      if (av < bv) return -1 * order;
      if (av > bv) return 1 * order;
      return 0;
    });
  });

  protected readonly clientTotal = computed(() =>
    this.serverSide() ? this.total() : this.sortedClientData().length
  );

  protected readonly pagedData = computed(() => {
    if (this.serverSide()) return this.data();
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedClientData().slice(start, start + this.pageSize());
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.clientTotal() / this.pageSize()))
  );

  protected readonly rangeStart = computed(() =>
    this.clientTotal() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  );

  protected readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.clientTotal()));

  protected readonly allOnPageSelected = computed(() => {
    const rows = this.pagedData();
    if (rows.length === 0) return false;
    const ids = this.selectedIds();
    return rows.every((row) => ids.has(this.trackBy()(row)));
  });

  protected readonly someOnPageSelected = computed(() => {
    const rows = this.pagedData();
    const ids = this.selectedIds();
    const selectedCount = rows.filter((row) => ids.has(this.trackBy()(row))).length;
    return selectedCount > 0 && selectedCount < rows.length;
  });

  protected sortIndicator(col: ColumnDef<T>): 'asc' | 'desc' | null {
    const key = col.sortKey ?? col.key;
    return this.sortBy() === key ? this.sortOrder() : null;
  }

  protected onHeaderClick(col: ColumnDef<T>): void {
    if (!col.sortable) return;
    const key = col.sortKey ?? col.key;
    if (this.sortBy() !== key) {
      this.sortBy.set(key);
      this.sortOrder.set('asc');
    } else {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    }
    this.page.set(1);
  }

  protected cellValue(row: T, col: ColumnDef<T>): unknown {
    return col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key];
  }

  protected cellContext(row: T, col: ColumnDef<T>): CellContext<T> {
    return { $implicit: row, row, value: this.cellValue(row, col), column: col };
  }

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(this.trackBy()(row));
  }

  protected toggleRow(row: T): void {
    const id = this.trackBy()(row);
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  protected toggleAllOnPage(): void {
    const next = new Set(this.selectedIds());
    const rows = this.pagedData();
    if (this.allOnPageSelected()) {
      rows.forEach((row) => next.delete(this.trackBy()(row)));
    } else {
      rows.forEach((row) => next.add(this.trackBy()(row)));
    }
    this.selectedIds.set(next);
  }

  protected visibleActions(row: T): RowAction<T>[] {
    return this.rowActions().filter((action) => !action.hidden?.(row));
  }

  protected toggleMenu(rowId: string): void {
    this.openMenuRowId.set(this.openMenuRowId() === rowId ? null : rowId);
  }

  protected onAction(action: RowAction<T>, row: T): void {
    this.openMenuRowId.set(null);
    if (action.disabled?.(row)) return;
    this.actionTriggered.emit({ action: action.id, item: row });
  }

  protected goToPage(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  protected onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.page.set(1);
  }
}
