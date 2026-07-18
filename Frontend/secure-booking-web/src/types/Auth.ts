export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}


export interface ApiValidationError {
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>; 
}