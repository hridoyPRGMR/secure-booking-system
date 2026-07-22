import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Route guard factory: only allows activation when the current user holds `code`. */
export function requirePermission(code: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.hasPermission(code) ? true : router.createUrlTree(['/users']);
  };
}
