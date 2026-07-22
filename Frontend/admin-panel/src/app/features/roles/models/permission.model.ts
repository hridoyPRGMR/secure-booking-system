/** Wire shape returned by GET /permissions — the full static 24-item catalog. */
export interface PermissionCatalogItem {
  code: string;
  area: string;
  action: string;
  description: string;
}

/** One `area` group (e.g. "Users") with its permissions, for rendering the picker. */
export interface PermissionAreaGroup {
  area: string;
  permissions: PermissionCatalogItem[];
}
