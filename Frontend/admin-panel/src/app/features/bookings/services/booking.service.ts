import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { Booking, BookingFormValue, BookingStatus } from '../models/booking.model';

export interface BookingQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  userId?: string;
  roomId?: string;
  status?: BookingStatus;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/bookings`;

  list(query: BookingQuery) {
    const params = new HttpParams({ fromObject: toHttpParams(query) });
    return this.http.get<PagedResult<Booking>>(this.baseUrl, { params });
  }

  create(value: BookingFormValue) {
    return this.http.post<Booking>(this.baseUrl, value);
  }

  update(id: string, value: BookingFormValue) {
    return this.http.put<Booking>(`${this.baseUrl}/${id}`, { id, ...value });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
