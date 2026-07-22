import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AdminUser, ApiProblemDetails, AuthResponse, RefreshResponse } from '../models/auth.model';
import { tokenStore } from './token-store';

export interface AuthActionResult {
  success: boolean;
  message?: string;
}

function toUser(source: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}): AdminUser {
  return {
    id: source.userId,
    firstName: source.firstName,
    lastName: source.lastName,
    email: source.email,
    roles: source.roles ?? [],
    permissions: source.permissions ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<AdminUser | null>(null);
  private readonly _isLoading = signal(true);

  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  hasPermission(code: string): boolean {
    return this._user()?.permissions.includes(code) ?? false;
  }

  constructor() {
    tokenStore.onUnauthorized(() => this._user.set(null));
  }

  /** Boot check: try a silent refresh so a page reload survives as long as the refresh cookie is valid. */
  async bootstrap(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true })
      );
      tokenStore.set(response.accessToken);
      this._user.set(toUser(response));
    } catch {
      tokenStore.clear();
      this._user.set(null);
    } finally {
      this._isLoading.set(false);
    }
  }

  async login(email: string, password: string): Promise<AuthActionResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password }, { withCredentials: true })
      );
      tokenStore.set(response.accessToken);
      this._user.set(toUser(response));
      return { success: true };
    } catch (error) {
      return { success: false, message: this.extractMessage(error) };
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true }));
    } catch {
      // Best-effort: local state is cleared regardless of API outcome.
    } finally {
      tokenStore.clear();
      this._user.set(null);
    }
  }

  private extractMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ApiProblemDetails | undefined;
      return problem?.detail ?? 'Invalid email or password.';
    }
    return 'A network error occurred. Please try again.';
  }
}
