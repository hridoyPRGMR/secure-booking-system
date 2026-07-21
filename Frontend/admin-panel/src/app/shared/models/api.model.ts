export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ListQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/** Drops null/undefined/empty-string values so HttpParams doesn't send them as literal "undefined". */
export function toHttpParams(params: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    result[key] = String(value);
  }
  return result;
}
