import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { Room, RoomFormValue, RoomType } from '../models/room.model';
import { firstValueFrom } from 'rxjs';

export interface RoomQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  hotelId?: string;
  type?: RoomType;
  isActive?: boolean;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/rooms`;

  list(query: RoomQuery) {
    const params = new HttpParams({ fromObject: toHttpParams(query) });
    return this.http.get<PagedResult<Room>>(this.baseUrl, { params });
  }

  /** Small, unpaginated fetch for populating dropdowns (Booking form's Room select). */
  async listAllForDropdown(): Promise<Room[]> {
    const params = new HttpParams({ fromObject: toHttpParams({ page: 1, pageSize: 200, sortBy: 'name' }) });
    const result = await firstValueFrom(this.http.get<PagedResult<Room>>(this.baseUrl, { params }));
    return result.items;
  }

  create(value: RoomFormValue) {
    return this.http.post<Room>(this.baseUrl, value);
  }

  update(id: string, value: RoomFormValue) {
    return this.http.put<Room>(`${this.baseUrl}/${id}`, { id, ...value });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
