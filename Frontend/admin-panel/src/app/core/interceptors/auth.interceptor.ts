import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { RefreshResponse } from '../models/auth.model';
import { tokenStore } from '../services/token-store';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh-token'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url.endsWith(endpoint));
}

function withAuth(req: HttpRequest<unknown>): HttpRequest<unknown> {
  const token = tokenStore.get();
  return req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Shared across all requests so concurrent 401s trigger only one refresh call.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  const http = inject(HttpClient);

  return next(withAuth(req)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshedToken$.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((token) => next(withAuth(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))))
        );
      }

      isRefreshing = true;
      refreshedToken$.next(null);

      return http.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true }).pipe(
        switchMap((response) => {
          tokenStore.set(response.accessToken);
          isRefreshing = false;
          refreshedToken$.next(response.accessToken);
          return next(withAuth(req));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          tokenStore.clear();
          tokenStore.notifyUnauthorized();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
