export type FilterFieldType = 'select' | 'date-range' | 'text';

export interface FilterOption {
  label: string;
  value: string;
}

export interface DateRangeValue {
  from: string | null;
  to: string | null;
}

/** Declarative definition for one filter control in `GridFilterComponent`. */
export interface FilterFieldDef {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  placeholder?: string;
}

/** Unified, typed payload emitted whenever any filter (or search) changes. */
export interface FilterState {
  search: string;
  values: Record<string, string | DateRangeValue | null>;
}

export const EMPTY_FILTER_STATE: FilterState = {
  search: '',
  values: {},
};
