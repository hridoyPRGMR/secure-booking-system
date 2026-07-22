import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { Role, RoleFormValue } from '../models/role.model';

export interface RoleQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/roles`;

  list(query: RoleQuery) {
    const params = new HttpParams({ fromObject: toHttpParams(query) });
    return this.http.get<PagedResult<Role>>(this.baseUrl, { params });
  }

  /** Small, unpaginated fetch for populating dropdowns (User form's Roles picker). */
  async listAllForDropdown(): Promise<Role[]> {
    const params = new HttpParams({ fromObject: toHttpParams({ page: 1, pageSize: 200, sortBy: 'name' }) });
    const result = await firstValueFrom(this.http.get<PagedResult<Role>>(this.baseUrl, { params }));
    return result.items;
  }

  get(id: string) {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  create(value: RoleFormValue) {
    return this.http.post<Role>(this.baseUrl, value);
  }

  update(id: string, value: RoleFormValue) {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, { id, ...value });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
