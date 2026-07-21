import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/config/api.config';
import { DynamicSliderComponent } from '../../../shared/components/dynamic-slider/dynamic-slider.component';
import { DataGridComponent, RowActionEvent } from '../../../shared/components/data-grid/data-grid.component';
import { GridFilterComponent } from '../../../shared/components/grid-filter/grid-filter.component';
import { ColumnDef, RowAction, SortOrder } from '../../../shared/models/grid.models';
import { FilterFieldDef, FilterState } from '../../../shared/models/filter.models';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error';
import { Hotel, HotelFormValue } from '../models/hotel.model';
import { HotelService } from '../services/hotel.service';
import { HotelFormComponent } from '../hotel-form/hotel-form.component';

const EMPTY_PAGE: PagedResult<Hotel> = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [DynamicSliderComponent, DataGridComponent, GridFilterComponent, HotelFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hotel-list.component.html',
})
export class HotelListComponent {
  private readonly hotelService = inject(HotelService);
  private readonly toast = inject(ToastService);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal('name');
  protected readonly sortOrder = signal<SortOrder>('asc');
  protected readonly search = signal('');
  protected readonly isActiveFilter = signal<boolean | null>(null);

  private readonly hotelsResource = httpResource<PagedResult<Hotel>>(
    () => ({
      url: `${API_BASE_URL}/hotels`,
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

  protected readonly items = computed(() => this.hotelsResource.value()?.items ?? []);
  protected readonly total = computed(() => this.hotelsResource.value()?.totalCount ?? 0);
  protected readonly isLoading = this.hotelsResource.isLoading;

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

  protected readonly columns: ColumnDef<Hotel>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'location', header: 'Location', accessor: (row) => `${row.locationCity}, ${row.locationCountry}` },
    { key: 'starRating', header: 'Stars', sortable: true, sortKey: 'starRating', align: 'center', accessor: (row) => `${row.starRating}★` },
    { key: 'roomCount', header: 'Rooms', align: 'center' },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      accessor: (row) => (row.isActive ? 'Active' : 'Inactive'),
    },
  ];

  protected readonly rowActions: RowAction<Hotel>[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete', variant: 'danger' },
  ];

  protected readonly trackById = (row: Hotel) => row.id;

  protected readonly sliderOpen = signal(false);
  protected readonly mode = signal<'create' | 'edit'>('create');
  protected readonly activeHotel = signal<Hotel | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly drawerTitle = computed(() => (this.mode() === 'edit' ? 'Edit hotel' : 'Add hotel'));

  protected readonly formInitialValue = computed<HotelFormValue | null>(() => {
    const hotel = this.activeHotel();
    if (!hotel) return null;
    const { name, description, starRating, imageUrl, isActive, locationId } = hotel;
    return { name, description, starRating, imageUrl, isActive, locationId };
  });

  protected onFiltersChanged(state: FilterState): void {
    this.search.set(state.search);
    const status = state.values['status'];
    this.isActiveFilter.set(status === 'true' ? true : status === 'false' ? false : null);
    this.page.set(1);
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.activeHotel.set(null);
    this.mode.set('create');
    this.sliderOpen.set(true);
  }

  protected onRowAction({ action, item }: RowActionEvent<Hotel>): void {
    if (action === 'delete') {
      this.confirmDelete(item);
      return;
    }
    this.formError.set(null);
    this.activeHotel.set(item);
    this.mode.set('edit');
    this.sliderOpen.set(true);
  }

  protected onFormSaved(value: HotelFormValue): void {
    this.submitting.set(true);
    this.formError.set(null);

    const active = this.activeHotel();
    const request$ =
      this.mode() === 'edit' && active ? this.hotelService.update(active.id, value) : this.hotelService.create(value);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.sliderOpen.set(false);
        this.toast.success(this.mode() === 'edit' ? 'Hotel updated.' : 'Hotel added.');
        this.hotelsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(extractApiErrorMessage(error));
      },
    });
  }

  private confirmDelete(hotel: Hotel): void {
    if (!confirm(`Delete ${hotel.name}? This cannot be undone.`)) return;

    this.hotelService.delete(hotel.id).subscribe({
      next: () => {
        this.toast.success('Hotel deleted.');
        this.hotelsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(error, 'Failed to delete hotel.'));
      },
    });
  }
}
