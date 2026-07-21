import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { CreateUserResult, User, UserFormValue } from '../models/user.model';

export interface UserQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  isActive?: boolean;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/users`;

  list(query: UserQuery) {
    const params = new HttpParams({ fromObject: toHttpParams(query) });
    return this.http.get<PagedResult<User>>(this.baseUrl, { params });
  }

  /** Small, unpaginated fetch for populating dropdowns (Booking form's User select). */
  async listAllForDropdown(): Promise<User[]> {
    const params = new HttpParams({ fromObject: toHttpParams({ page: 1, pageSize: 200, sortBy: 'firstName' }) });
    const result = await firstValueFrom(this.http.get<PagedResult<User>>(this.baseUrl, { params }));
    return result.items;
  }

  create(value: UserFormValue) {
    return this.http.post<CreateUserResult>(this.baseUrl, value);
  }

  update(id: string, value: UserFormValue) {
    return this.http.put<User>(`${this.baseUrl}/${id}`, { id, ...value });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
