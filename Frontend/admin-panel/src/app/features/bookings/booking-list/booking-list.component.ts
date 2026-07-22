import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
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
import { BOOKING_STATUSES, Booking, BookingFormValue } from '../models/booking.model';
import { BookingService } from '../services/booking.service';
import { BookingFormComponent } from '../booking-form/booking-form.component';

const EMPTY_PAGE: PagedResult<Booking> = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 };

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CurrencyPipe, DynamicSliderComponent, DataGridComponent, GridFilterComponent, BookingFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent {
  private readonly bookingService = inject(BookingService);
  private readonly toast = inject(ToastService);
  protected readonly authService = inject(AuthService);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal('createdAt');
  protected readonly sortOrder = signal<SortOrder>('desc');
  protected readonly search = signal('');
  protected readonly statusFilter = signal<string | null>(null);

  private readonly bookingsResource = httpResource<PagedResult<Booking>>(
    () => ({
      url: `${API_BASE_URL}/bookings`,
      params: toHttpParams({
        page: this.page(),
        pageSize: this.pageSize(),
        search: this.search(),
        sortBy: this.sortBy(),
        sortDescending: this.sortOrder() === 'desc',
        status: this.statusFilter(),
      }),
    }),
    { defaultValue: EMPTY_PAGE }
  );

  protected readonly items = computed(() => this.bookingsResource.value()?.items ?? []);
  protected readonly total = computed(() => this.bookingsResource.value()?.totalCount ?? 0);
  protected readonly isLoading = this.bookingsResource.isLoading;

  protected readonly statusCellTpl = viewChild<TemplateRef<CellContext<Booking>>>('statusCell');
  protected readonly priceCellTpl = viewChild<TemplateRef<CellContext<Booking>>>('priceCell');

  protected readonly filterFields: FilterFieldDef[] = [
    { key: 'status', label: 'Status', type: 'select', options: BOOKING_STATUSES.map((s) => ({ label: s, value: s })) },
  ];

  protected readonly columns = computed<ColumnDef<Booking>[]>(() => [
    { key: 'userFullName', header: 'Guest' },
    { key: 'roomName', header: 'Room', accessor: (row) => `${row.hotelName} — ${row.roomName}` },
    {
      key: 'checkIn',
      header: 'Check-in',
      sortable: true,
      accessor: (row) => new Date(row.checkIn).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    },
    {
      key: 'checkOut',
      header: 'Check-out',
      sortable: true,
      accessor: (row) => new Date(row.checkOut).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    },
    { key: 'status', header: 'Status', cellTemplate: this.statusCellTpl() },
    { key: 'totalPrice', header: 'Total', align: 'right', cellTemplate: this.priceCellTpl() },
  ]);

  protected readonly rowActions: RowAction<Booking>[] = [
    { id: 'edit', label: 'Edit', hidden: () => !this.authService.hasPermission('Bookings.Update') },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'danger',
      hidden: () => !this.authService.hasPermission('Bookings.Delete'),
    },
  ];

  protected readonly trackById = (row: Booking) => row.id;

  protected readonly sliderOpen = signal(false);
  protected readonly mode = signal<'create' | 'edit'>('create');
  protected readonly activeBooking = signal<Booking | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly drawerTitle = computed(() => (this.mode() === 'edit' ? 'Edit booking' : 'Add booking'));

  protected readonly formInitialValue = computed<BookingFormValue | null>(() => {
    const booking = this.activeBooking();
    if (!booking) return null;
    const { userId, roomId, checkIn, checkOut, status, notes } = booking;
    return { userId, roomId, checkIn, checkOut, status, notes };
  });

  protected onFiltersChanged(state: FilterState): void {
    this.search.set(state.search);
    this.statusFilter.set((state.values['status'] as string) || null);
    this.page.set(1);
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.activeBooking.set(null);
    this.mode.set('create');
    this.sliderOpen.set(true);
  }

  protected onRowAction({ action, item }: RowActionEvent<Booking>): void {
    if (action === 'delete') {
      this.confirmDelete(item);
      return;
    }
    this.formError.set(null);
    this.activeBooking.set(item);
    this.mode.set('edit');
    this.sliderOpen.set(true);
  }

  protected onFormSaved(value: BookingFormValue): void {
    this.submitting.set(true);
    this.formError.set(null);

    const active = this.activeBooking();
    const request$ =
      this.mode() === 'edit' && active
        ? this.bookingService.update(active.id, value)
        : this.bookingService.create(value);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.sliderOpen.set(false);
        this.toast.success(this.mode() === 'edit' ? 'Booking updated.' : 'Booking added.');
        this.bookingsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(extractApiErrorMessage(error));
      },
    });
  }

  private confirmDelete(booking: Booking): void {
    if (!confirm(`Delete this booking for ${booking.userFullName}? This cannot be undone.`)) return;

    this.bookingService.delete(booking.id).subscribe({
      next: () => {
        this.toast.success('Booking deleted.');
        this.bookingsResource.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(error, 'Failed to delete booking.'));
      },
    });
  }
}
