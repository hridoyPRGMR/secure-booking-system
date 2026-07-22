import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/config/api.config';
import { DynamicSliderComponent } from '../../../shared/components/dynamic-slider/dynamic-slider.component';
import { DataGridComponent, RowActionEvent } from '../../../shared/components/data-grid/data-grid.component';
import { GridFilterComponent } from '../../../shared/components/grid-filter/grid-filter.component';
import { ColumnDef, RowAction, SortOrder } from '../../../shared/models/grid.models';
import { FilterState } from '../../../shared/models/filter.models';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error';
import { Location, LocationFormValue } from '../models/location.model';
import { LocationService } from '../services/location.service';
import { LocationFormComponent } from '../location-form/location-form.component';

const EMPTY_PAGE: PagedResult<Location> = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [DynamicSliderComponent, DataGridComponent, GridFilterComponent, LocationFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './location-list.component.html',
})
export class LocationListComponent {
  private readonly locationService = inject(LocationService);
  private readonly toast = inject(ToastService);
  protected readonly authService = inject(AuthService);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal('city');
  protected readonly sortOrder = signal<SortOrder>('asc');
  protected readonly search = signal('');

  private readonly locationsResource = httpResource<PagedResult<Location>>(
    () => ({
      url: `${API_BASE_URL}/locations`,
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

  protected readonly items = computed(() => this.locationsResource.value()?.items ?? []);
  protected readonly total = computed(() => this.locationsResource.value()?.totalCount ?? 0);
  protected readonly isLoading = this.locationsResource.isLoading;

  protected readonly columns: ColumnDef<Location>[] = [
    { key: 'city', header: 'City', sortable: true },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'address', header: 'Address' },
    { key: 'hotelCount', header: 'Hotels', align: 'center' },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    },
  ];

  protected readonly rowActions: RowAction<Location>[] = [
    { id: 'edit', label: 'Edit', hidden: () => !this.authService.hasPermission('Locations.Update') },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'danger',
      hidden: () => !this.authService.hasPermission('Locations.Delete'),
    },
  ];

  protected readonly trackById = (row: Location) => row.id;

  protected readonly sliderOpen = signal(false);
  protected readonly mode = signal<'create' | 'edit'>('create');
  protected readonly activeLocation = signal<Location | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly drawerTitle = computed(() => (this.mode() === 'edit' ? 'Edit location' : 'Add location'));

  protected readonly formInitialValue = computed<LocationFormValue | null>(() => {
    const loc = this.activeLocation();
    if (!loc) return null;
    const { city, country, address, latitude, longitude } = loc;
    return { city, country, address, latitude, longitude };
  });

  protected onFiltersChanged(state: FilterState): void {
    this.search.set(state.search);
    this.page.set(1);
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.activeLocation.set(null);
    this.mode.set('create');
    this.sliderOpen.set(true);
  }

  protected onRowAction({ action, item }: RowActionEvent<Location>): void {
    if (action === 'delete') {
      this.confirmDelete(item);
      return;
    }
    this.formError.set(null);
    this.activeLocation.set(item);
    this.mode.set('edit');
    this.sliderOpen.set(true);
  }

  protected async onFormSaved(value: LocationFormValue): Promise<void> {
    this.submitting.set(true);
    this.formError.set(null);

    const active = this.activeLocation();
    const request$ =
      this.mode() === 'edit' && active
        ? this.locationService.update(active.id, value)
        : this.locationService.create(value);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.sliderOpen.set(false);
        this.toast.success(this.mode() === 'edit' ? 'Location updated.' : 'Location added.');
        this.locationsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(extractApiErrorMessage(error));
      },
    });
  }

  private confirmDelete(location: Location): void {
    if (!confirm(`Delete ${location.city}, ${location.country}? This cannot be undone.`)) return;

    this.locationService.delete(location.id).subscribe({
      next: () => {
        this.toast.success('Location deleted.');
        this.locationsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(error, 'Failed to delete location.'));
      },
    });
  }
}
