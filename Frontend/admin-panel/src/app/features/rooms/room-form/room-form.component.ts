import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotelService } from '../../hotels/services/hotel.service';
import { Hotel } from '../../hotels/models/hotel.model';
import { ROOM_TYPES, RoomFormValue } from '../models/room.model';

@Component({
  selector: 'app-room-form',
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

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
          <input
            type="text"
            formControlName="name"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('name')"
            [class.border-slate-300]="!isInvalid('name')"
          />
          @if (isInvalid('name')) {
            <p class="mt-1 text-xs text-red-500">Name is required.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
          <select
            formControlName="type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
          >
            @for (t of roomTypes; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Hotel</label>
        <select
          formControlName="hotelId"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('hotelId')"
          [class.border-slate-300]="!isInvalid('hotelId')"
        >
          <option value="" disabled>Select a hotel…</option>
          @for (hotel of hotels(); track hotel.id) {
            <option [value]="hotel.id">{{ hotel.name }}</option>
          }
        </select>
        @if (isInvalid('hotelId')) {
          <p class="mt-1 text-xs text-red-500">Hotel is required.</p>
        }
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description (optional)</label>
        <textarea
          formControlName="description"
          rows="2"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity</label>
          <input
            type="number"
            min="1"
            formControlName="capacity"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('capacity')"
            [class.border-slate-300]="!isInvalid('capacity')"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Price / night</label>
          <input
            type="number"
            min="0"
            step="0.01"
            formControlName="pricePerNight"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('pricePerNight')"
            [class.border-slate-300]="!isInvalid('pricePerNight')"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Image URL (optional)</label>
        <input
          type="text"
          formControlName="imageUrl"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" formControlName="isActive" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        Active
      </label>

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
          {{ mode() === 'edit' ? 'Save changes' : 'Add room' }}
        </button>
      </div>
    </form>
  `,
})
export class RoomFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hotelService = inject(HotelService);

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<RoomFormValue | null>(null);
  readonly submitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<RoomFormValue>();
  readonly cancelled = output<void>();

  protected readonly roomTypes = ROOM_TYPES;
  protected readonly hotels = signal<Hotel[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    type: this.fb.nonNullable.control<(typeof ROOM_TYPES)[number]>('Standard'),
    description: this.fb.control<string | null>(null),
    capacity: [2, [Validators.required, Validators.min(1)]],
    pricePerNight: [100, [Validators.required, Validators.min(0.01)]],
    imageUrl: this.fb.control<string | null>(null),
    isActive: [true],
    hotelId: ['', Validators.required],
  });

  constructor() {
    this.hotelService.listAllForDropdown().then((hotels) => this.hotels.set(hotels));

    effect(() => {
      const value = this.initialValue();
      this.form.reset(
        value ?? {
          name: '',
          type: 'Standard',
          description: null,
          capacity: 2,
          pricePerNight: 100,
          imageUrl: null,
          isActive: true,
          hotelId: '',
        }
      );
    });
  }

  protected isInvalid(name: 'name' | 'hotelId' | 'capacity' | 'pricePerNight'): boolean {
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
