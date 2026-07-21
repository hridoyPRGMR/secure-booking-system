import { TemplateRef } from '@angular/core';

export type SortOrder = 'asc' | 'desc';

/** Context handed to a custom cell `ng-template` via `NgTemplateOutlet`. */
export interface CellContext<T> {
  $implicit: T;
  row: T;
  value: unknown;
  column: ColumnDef<T>;
}

/** Declarative column configuration for `DataGridComponent<T>`. */
export interface ColumnDef<T> {
  /** Unique key. Also used as the sort key unless `sortKey` is set. */
  key: string;
  header: string;
  /** Dot-path or accessor used to read the cell value off a row. */
  accessor?: (row: T) => unknown;
  sortable?: boolean;
  /** Overrides `key` when the API's sort field differs from the display key. */
  sortKey?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Custom cell template — receives `CellContext<T>` via `let-ctx`. */
  cellTemplate?: TemplateRef<CellContext<T>>;
}

/** A single row action rendered in the actions column (Edit/View/Delete, etc). */
export interface RowAction<T> {
  id: string;
  label: string;
  icon?: string;
  /** Visually flags destructive actions (e.g. Delete) in red. */
  variant?: 'default' | 'danger';
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface SortState {
  sortBy: string;
  sortOrder: SortOrder;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** The full querystring-able state a grid needs to ask a backend for a page of data. */
export interface GridQueryState {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: SortOrder;
  search: string;
  filters: Record<string, unknown>;
}

export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100] as const;
export type PageSize = (typeof DEFAULT_PAGE_SIZES)[number];

export const DEFAULT_GRID_QUERY_STATE: GridQueryState = {
  page: 1,
  pageSize: 10,
  sortBy: '',
  sortOrder: 'asc',
  search: '',
  filters: {},
};
