export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserFormValue {
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateUserResult {
  user: User;
  temporaryPassword: string;
}
