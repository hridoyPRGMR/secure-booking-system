// Note: the refresh token itself is never present in these payloads — the
// backend only ever transports it via the Secure/HttpOnly `refreshToken` cookie.
export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Not yet issued by the backend (no role/claim system in the JWT today) —
  // present here so ProtectedRoute's allowedRoles check has somewhere to read from
  // once the API starts including it.
  roles?: string[];
}


export interface ApiValidationError {
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}