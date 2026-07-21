import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { Location, LocationFormValue } from '../models/location.model';

export interface LocationQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/locations`;

  list(query: LocationQuery) {
    const params = new HttpParams({ fromObject: toHttpParams(query) });
    return this.http.get<PagedResult<Location>>(this.baseUrl, { params });
  }

  /** Small, unpaginated fetch for populating dropdowns (Hotel form's Location select). */
  async listAllForDropdown(): Promise<Location[]> {
    const params = new HttpParams({ fromObject: toHttpParams({ page: 1, pageSize: 200, sortBy: 'city' }) });
    const result = await firstValueFrom(this.http.get<PagedResult<Location>>(this.baseUrl, { params }));
    return result.items;
  }

  create(value: LocationFormValue) {
    return this.http.post<Location>(this.baseUrl, value);
  }

  update(id: string, value: LocationFormValue) {
    return this.http.put<Location>(`${this.baseUrl}/${id}`, { id, ...value });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
