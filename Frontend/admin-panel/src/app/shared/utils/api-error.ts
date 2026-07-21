import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblemDetails } from '../../core/models/auth.model';

export function extractApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ApiProblemDetails | undefined;
    return problem?.detail ?? fallback;
  }
  return fallback;
}

/** Maps a 400 ValidationProblemDetails.errors map (PascalCase keys) onto reactive-form field names. */
export function extractFieldErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof HttpErrorResponse && error.status === 400) {
    const problem = error.error as ApiProblemDetails | undefined;
    return problem?.errors ?? null;
  }
  return null;
}
