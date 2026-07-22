export interface Role {
  id: string;
  name: string;
  description: string;
  permissionCodes: string[];
  userCount: number;
  createdAt: string;
}

export interface RoleFormValue {
  name: string;
  description: string;
  permissionCodes: string[];
}
