export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface ApiProblemDetails {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string[]>;
}
