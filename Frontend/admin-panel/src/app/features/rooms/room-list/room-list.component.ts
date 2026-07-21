import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/config/api.config';
import { DynamicSliderComponent } from '../../../shared/components/dynamic-slider/dynamic-slider.component';
import { DataGridComponent, RowActionEvent } from '../../../shared/components/data-grid/data-grid.component';
import { GridFilterComponent } from '../../../shared/components/grid-filter/grid-filter.component';
import { CellContext, ColumnDef, RowAction, SortOrder } from '../../../shared/models/grid.models';
import { FilterFieldDef, FilterState } from '../../../shared/models/filter.models';
import { PagedResult, toHttpParams } from '../../../shared/models/api.model';
import { extractApiErrorMessage } from '../../../shared/utils/api-error';
import { ROOM_TYPES, Room, RoomFormValue } from '../models/room.model';
import { RoomService } from '../services/room.service';
import { RoomFormComponent } from '../room-form/room-form.component';

const EMPTY_PAGE: PagedResult<Room> = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CurrencyPipe, DynamicSliderComponent, DataGridComponent, GridFilterComponent, RoomFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-list.component.html',
})
export class RoomListComponent {
  private readonly roomService = inject(RoomService);
  private readonly toast = inject(ToastService);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal('name');
  protected readonly sortOrder = signal<SortOrder>('asc');
  protected readonly search = signal('');
  protected readonly typeFilter = signal<string | null>(null);
  protected readonly isActiveFilter = signal<boolean | null>(null);

  private readonly roomsResource = httpResource<PagedResult<Room>>(
    () => ({
      url: `${API_BASE_URL}/rooms`,
      params: toHttpParams({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search(),
        sortBy: this.sortBy(),
        sortDescending: this.sortOrder() === 'desc',
        type: this.typeFilter(),
        isActive: this.isActiveFilter(),
      }),
    }),
    { defaultValue: EMPTY_PAGE }
  );

  protected readonly items = computed(() => this.roomsResource.value()?.items ?? []);
  protected readonly total = computed(() => this.roomsResource.value()?.totalCount ?? 0);
  protected readonly isLoading = this.roomsResource.isLoading;

  protected readonly priceCellTpl = viewChild<TemplateRef<CellContext<Room>>>('priceCell');

  protected readonly filterFields: FilterFieldDef[] = [
    { key: 'type', label: 'Type', type: 'select', options: ROOM_TYPES.map((t) => ({ label: t, value: t })) },
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

  protected readonly columns = computed<ColumnDef<Room>[]>(() => [
    { key: 'name', header: 'Room', sortable: true },
    { key: 'hotelName', header: 'Hotel' },
    { key: 'type', header: 'Type' },
    { key: 'capacity', header: 'Capacity', sortable: true, align: 'center' },
    { key: 'pricePerNight', header: 'Price / night', sortable: true, align: 'right', cellTemplate: this.priceCellTpl() },
    { key: 'bookingCount', header: 'Bookings', align: 'center' },
  ]);

  protected readonly rowActions: RowAction<Room>[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete', variant: 'danger' },
  ];

  protected readonly trackById = (row: Room) => row.id;

  protected readonly sliderOpen = signal(false);
  protected readonly mode = signal<'create' | 'edit'>('create');
  protected readonly activeRoom = signal<Room | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly drawerTitle = computed(() => (this.mode() === 'edit' ? 'Edit room' : 'Add room'));

  protected readonly formInitialValue = computed<RoomFormValue | null>(() => {
    const room = this.activeRoom();
    if (!room) return null;
    const { name, type, description, capacity, pricePerNight, imageUrl, isActive, hotelId } = room;
    return { name, type, description, capacity, pricePerNight, imageUrl, isActive, hotelId };
  });

  protected onFiltersChanged(state: FilterState): void {
    this.search.set(state.search);
    this.typeFilter.set((state.values['type'] as string) || null);
    const status = state.values['status'];
    this.isActiveFilter.set(status === 'true' ? true : status === 'false' ? false : null);
    this.page.set(1);
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.activeRoom.set(null);
    this.mode.set('create');
    this.sliderOpen.set(true);
  }

  protected onRowAction({ action, item }: RowActionEvent<Room>): void {
    if (action === 'delete') {
      this.confirmDelete(item);
      return;
    }
    this.formError.set(null);
    this.activeRoom.set(item);
    this.mode.set('edit');
    this.sliderOpen.set(true);
  }

  protected onFormSaved(value: RoomFormValue): void {
    this.submitting.set(true);
    this.formError.set(null);

    const active = this.activeRoom();
    const request$ =
      this.mode() === 'edit' && active ? this.roomService.update(active.id, value) : this.roomService.create(value);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.sliderOpen.set(false);
        this.toast.success(this.mode() === 'edit' ? 'Room updated.' : 'Room added.');
        this.roomsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(extractApiErrorMessage(error));
      },
    });
  }

  private confirmDelete(room: Room): void {
    if (!confirm(`Delete ${room.name}? This cannot be undone.`)) return;

    this.roomService.delete(room.id).subscribe({
      next: () => {
        this.toast.success('Room deleted.');
        this.roomsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(error, 'Failed to delete room.'));
      },
    });
  }
}
