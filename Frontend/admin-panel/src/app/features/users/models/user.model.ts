export interface RoleSummary {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roles: RoleSummary[];
}

export interface UserFormValue {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: string[];
}

export interface CreateUserResult {
  user: User;
  temporaryPassword: string;
}
