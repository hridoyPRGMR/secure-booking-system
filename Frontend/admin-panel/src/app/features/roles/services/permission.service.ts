import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { PermissionCatalogItem } from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/permissions`;

  /** Full static 24-item permission catalog — no pagination. */
  list(): Observable<PermissionCatalogItem[]> {
    return this.http.get<PermissionCatalogItem[]>(this.baseUrl);
  }
}
