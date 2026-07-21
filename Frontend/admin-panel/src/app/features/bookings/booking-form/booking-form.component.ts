import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/models/user.model';
import { RoomService } from '../../rooms/services/room.service';
import { Room } from '../../rooms/models/room.model';
import { BOOKING_STATUSES, BookingFormValue } from '../models/booking.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
      @if (serverError()) {
        <div class="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950 dark:text-red-300">
          {{ serverError() }}
        </div>
      }

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Guest</label>
        <select
          formControlName="userId"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('userId')"
          [class.border-slate-300]="!isInvalid('userId')"
        >
          <option value="" disabled>Select a guest…</option>
          @for (u of users(); track u.id) {
            <option [value]="u.id">{{ u.firstName }} {{ u.lastName }} ({{ u.email }})</option>
          }
        </select>
        @if (isInvalid('userId')) {
          <p class="mt-1 text-xs text-red-500">Guest is required.</p>
        }
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Room</label>
        <select
          formControlName="roomId"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('roomId')"
          [class.border-slate-300]="!isInvalid('roomId')"
        >
          <option value="" disabled>Select a room…</option>
          @for (r of rooms(); track r.id) {
            <option [value]="r.id">{{ r.hotelName }} — {{ r.name }}</option>
          }
        </select>
        @if (isInvalid('roomId')) {
          <p class="mt-1 text-xs text-red-500">Room is required.</p>
        }
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Check-in</label>
          <input
            type="date"
            formControlName="checkIn"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('checkIn')"
            [class.border-slate-300]="!isInvalid('checkIn')"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Check-out</label>
          <input
            type="date"
            formControlName="checkOut"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('checkOut')"
            [class.border-slate-300]="!isInvalid('checkOut')"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
        <select
          formControlName="status"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
        >
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes (optional)</label>
        <textarea
          formControlName="notes"
          rows="2"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
        ></textarea>
      </div>

      <div class="mt-2 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          (click)="cancelled.emit()"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="submitting()"
          class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          @if (submitting()) {
            <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          }
          {{ mode() === 'edit' ? 'Save changes' : 'Add booking' }}
        </button>
      </div>
    </form>
  `,
})
export class BookingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roomService = inject(RoomService);

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<BookingFormValue | null>(null);
  readonly submitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<BookingFormValue>();
  readonly cancelled = output<void>();

  protected readonly statuses = BOOKING_STATUSES;
  protected readonly users = signal<User[]>([]);
  protected readonly rooms = signal<Room[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    roomId: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    status: this.fb.nonNullable.control<(typeof BOOKING_STATUSES)[number]>('Pending'),
    notes: this.fb.control<string | null>(null),
  });

  constructor() {
    this.userService.listAllForDropdown().then((users) => this.users.set(users));
    this.roomService.listAllForDropdown().then((rooms) => this.rooms.set(rooms));

    effect(() => {
      const value = this.initialValue();
      this.form.reset(
        value
          ? { ...value, checkIn: value.checkIn.slice(0, 10), checkOut: value.checkOut.slice(0, 10) }
          : { userId: '', roomId: '', checkIn: '', checkOut: '', status: 'Pending', notes: null }
      );
    });
  }

  protected isInvalid(name: 'userId' | 'roomId' | 'checkIn' | 'checkOut'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
