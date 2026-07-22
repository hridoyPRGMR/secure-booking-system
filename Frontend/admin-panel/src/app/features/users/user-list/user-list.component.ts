import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/config/api.config';
import { DynamicSliderComponent } from '../../../shared/components/dynamic-slider/dynamic-slider.component';
import { DataGridComponent, RowActionEvent } from '../../../shared/components/data-grid/data-grid.component';
import { GridFilterComponent } from '../../../shared/components/grid-filter/grid-filter.component';
import { CellContext, ColumnDef, RowAction, SortOrder } from '../../../shared/models/grid.models';
import { FilterFieldDef, FilterState } from '../../../shared/models/filter.models';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error';
import { User, UserFormValue } from '../models/user.model';
import { UserService } from '../services/user.service';
import { UserFormComponent } from '../user-form/user-form.component';

const EMPTY_PAGE: PagedResult<User> = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [DynamicSliderComponent, DataGridComponent, GridFilterComponent, UserFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  protected readonly authService = inject(AuthService);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal('firstName');
  protected readonly sortOrder = signal<SortOrder>('asc');
  protected readonly search = signal('');
  protected readonly isActiveFilter = signal<boolean | null>(null);

  private readonly usersResource = httpResource<PagedResult<User>>(
    () => ({
      url: `${API_BASE_URL}/users`,
      params: toHttpParams({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search(),
        sortBy: this.sortBy(),
        sortDescending: this.sortOrder() === 'desc',
        isActive: this.isActiveFilter(),
      }),
    }),
    { defaultValue: EMPTY_PAGE }
  );

  protected readonly items = computed(() => this.usersResource.value()?.items ?? []);
  protected readonly total = computed(() => this.usersResource.value()?.totalCount ?? 0);
  protected readonly isLoading = this.usersResource.isLoading;

  protected readonly statusCellTpl = viewChild<TemplateRef<CellContext<User>>>('statusCell');
  protected readonly rolesCellTpl = viewChild<TemplateRef<CellContext<User>>>('rolesCell');

  protected readonly filterFields: FilterFieldDef[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
    },
  ];

  protected readonly columns = computed<ColumnDef<User>[]>(() => [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      sortKey: 'firstName',
      accessor: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'isActive', header: 'Status', cellTemplate: this.statusCellTpl() },
    { key: 'roles', header: 'Roles', cellTemplate: this.rolesCellTpl() },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    },
  ]);

  protected readonly rowActions: RowAction<User>[] = [
    { id: 'edit', label: 'Edit', hidden: () => !this.authService.hasPermission('Users.Update') },
    { id: 'delete', label: 'Delete', variant: 'danger', hidden: () => !this.authService.hasPermission('Users.Delete') },
  ];

  protected readonly trackById = (row: User) => row.id;

  protected readonly sliderOpen = signal(false);
  protected readonly mode = signal<'create' | 'edit'>('create');
  protected readonly activeUser = signal<User | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly drawerTitle = computed(() => (this.mode() === 'edit' ? 'Edit user' : 'Add user'));

  protected readonly formInitialValue = computed<UserFormValue | null>(() => {
    const user = this.activeUser();
    if (!user) return null;
    const { firstName, lastName, email, roles } = user;
    return { firstName, lastName, email, roleIds: roles.map((r) => r.id) };
  });

  protected onFiltersChanged(state: FilterState): void {
    this.search.set(state.search);
    const status = state.values['status'];
    this.isActiveFilter.set(status === 'true' ? true : status === 'false' ? false : null);
    this.page.set(1);
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.activeUser.set(null);
    this.mode.set('create');
    this.sliderOpen.set(true);
  }

  protected onRowAction({ action, item }: RowActionEvent<User>): void {
    if (action === 'delete') {
      this.confirmDelete(item);
      return;
    }
    this.formError.set(null);
    this.activeUser.set(item);
    this.mode.set('edit');
    this.sliderOpen.set(true);
  }

  protected onFormSaved(value: UserFormValue): void {
    this.submitting.set(true);
    this.formError.set(null);

    const active = this.activeUser();

    if (this.mode() === 'edit' && active) {
      this.userService.update(active.id, value).subscribe({
        next: () => {
          this.submitting.set(false);
          this.sliderOpen.set(false);
          this.toast.success(`${value.firstName} ${value.lastName} was updated.`);
          this.usersResource.reload();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.formError.set(extractApiErrorMessage(error));
        },
      });
      return;
    }

    this.userService.create(value).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.sliderOpen.set(false);
        this.toast.success(
          `${value.firstName} ${value.lastName} was added. Temporary password: ${result.temporaryPassword}`,
          10000
        );
        this.usersResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(extractApiErrorMessage(error));
      },
    });
  }

  private confirmDelete(user: User): void {
    if (!confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) return;

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.toast.success(`${user.firstName} ${user.lastName} was deleted.`);
        this.usersResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(error, 'Failed to delete user.'));
      },
    });
  }
}
