import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { Hotel, HotelFormValue } from '../models/hotel.model';

export interface HotelQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  locationId?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/hotels`;

  list(query: HotelQuery) {
    const params = new HttpParams({ fromObject: toHttpParams(query) });
    return this.http.get<PagedResult<Hotel>>(this.baseUrl, { params });
  }

  /** Small, unpaginated fetch for populating dropdowns (Room form's Hotel select). */
  async listAllForDropdown(): Promise<Hotel[]> {
    const params = new HttpParams({ fromObject: toHttpParams({ page: 1, pageSize: 200, sortBy: 'name' }) });
    const result = await firstValueFrom(this.http.get<PagedResult<Hotel>>(this.baseUrl, { params }));
    return result.items;
  }

  create(value: HotelFormValue) {
    return this.http.post<Hotel>(this.baseUrl, value);
  }

  update(id: string, value: HotelFormValue) {
    return this.http.put<Hotel>(`${this.baseUrl}/${id}`, { id, ...value });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
