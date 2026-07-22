import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/config/api.config';
import { DynamicSliderComponent } from '../../../shared/components/dynamic-slider/dynamic-slider.component';
import { DataGridComponent, RowActionEvent } from '../../../shared/components/data-grid/data-grid.component';
import { GridFilterComponent } from '../../../shared/components/grid-filter/grid-filter.component';
import { CellContext, ColumnDef, RowAction, SortOrder } from '../../../shared/models/grid.models';
import { FilterState } from '../../../shared/models/filter.models';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error';
import { Role, RoleFormValue } from '../models/role.model';
import { RoleService } from '../services/role.service';
import { RoleFormComponent } from '../role-form/role-form.component';

const EMPTY_PAGE: PagedResult<Role> = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [DynamicSliderComponent, DataGridComponent, GridFilterComponent, RoleFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-list.component.html',
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);
  private readonly toast = inject(ToastService);
  protected readonly authService = inject(AuthService);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal('name');
  protected readonly sortOrder = signal<SortOrder>('asc');
  protected readonly search = signal('');

  private readonly rolesResource = httpResource<PagedResult<Role>>(
    () => ({
      url: `${API_BASE_URL}/roles`,
      params: toHttpParams({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search(),
        sortBy: this.sortBy(),
        sortDescending: this.sortOrder() === 'desc',
      }),
    }),
    { defaultValue: EMPTY_PAGE }
  );

  protected readonly items = computed(() => this.rolesResource.value()?.items ?? []);
  protected readonly total = computed(() => this.rolesResource.value()?.totalCount ?? 0);
  protected readonly isLoading = this.rolesResource.isLoading;

  protected readonly permissionsCellTpl = viewChild<TemplateRef<CellContext<Role>>>('permissionsCell');

  protected readonly columns = computed<ColumnDef<Role>[]>(() => [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'permissionCodes', header: 'Permissions', cellTemplate: this.permissionsCellTpl() },
    { key: 'userCount', header: 'Users', align: 'center' },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    },
  ]);

  protected readonly rowActions: RowAction<Role>[] = [
    { id: 'edit', label: 'Edit', hidden: () => !this.authService.hasPermission('Roles.Update') },
    { id: 'delete', label: 'Delete', variant: 'danger', hidden: () => !this.authService.hasPermission('Roles.Delete') },
  ];

  protected readonly trackById = (row: Role) => row.id;

  protected readonly sliderOpen = signal(false);
  protected readonly mode = signal<'create' | 'edit'>('create');
  protected readonly activeRole = signal<Role | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly drawerTitle = computed(() => (this.mode() === 'edit' ? 'Edit role' : 'Add role'));

  protected readonly formInitialValue = computed<RoleFormValue | null>(() => {
    const role = this.activeRole();
    if (!role) return null;
    const { name, description, permissionCodes } = role;
    return { name, description, permissionCodes };
  });

  protected onFiltersChanged(state: FilterState): void {
    this.search.set(state.search);
    this.page.set(1);
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.activeRole.set(null);
    this.mode.set('create');
    this.sliderOpen.set(true);
  }

  protected onRowAction({ action, item }: RowActionEvent<Role>): void {
    if (action === 'delete') {
      this.confirmDelete(item);
      return;
    }
    this.formError.set(null);
    this.activeRole.set(item);
    this.mode.set('edit');
    this.sliderOpen.set(true);
  }

  protected onFormSaved(value: RoleFormValue): void {
    this.submitting.set(true);
    this.formError.set(null);

    const active = this.activeRole();
    const request$ =
      this.mode() === 'edit' && active ? this.roleService.update(active.id, value) : this.roleService.create(value);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.sliderOpen.set(false);
        this.toast.success(this.mode() === 'edit' ? 'Role updated.' : 'Role added.');
        this.rolesResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(extractApiErrorMessage(error));
      },
    });
  }

  private confirmDelete(role: Role): void {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

    this.roleService.delete(role.id).subscribe({
      next: () => {
        this.toast.success('Role deleted.');
        this.rolesResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(error, 'Failed to delete role.'));
      },
    });
  }
}
