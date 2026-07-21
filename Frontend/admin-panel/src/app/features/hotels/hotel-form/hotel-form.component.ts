import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService } from '../../locations/services/location.service';
import { Location } from '../../locations/models/location.model';
import { HotelFormValue } from '../models/hotel.model';

@Component({
  selector: 'app-hotel-form',
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
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
        <input
          type="text"
          formControlName="name"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('name')"
          [class.border-slate-300]="!isInvalid('name')"
          [class.dark:border-slate-600]="!isInvalid('name')"
        />
        @if (isInvalid('name')) {
          <p class="mt-1 text-xs text-red-500">Name is required.</p>
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
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
          <select
            formControlName="locationId"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('locationId')"
            [class.border-slate-300]="!isInvalid('locationId')"
          >
            <option value="" disabled>Select a location…</option>
            @for (loc of locations(); track loc.id) {
              <option [value]="loc.id">{{ loc.city }}, {{ loc.country }}</option>
            }
          </select>
          @if (isInvalid('locationId')) {
            <p class="mt-1 text-xs text-red-500">Location is required.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Star rating</label>
          <select
            formControlName="starRating"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
          >
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <option [value]="n">{{ n }} star{{ n > 1 ? 's' : '' }}</option>
            }
          </select>
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
          {{ mode() === 'edit' ? 'Save changes' : 'Add hotel' }}
        </button>
      </div>
    </form>
  `,
})
export class HotelFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly locationService = inject(LocationService);

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<HotelFormValue | null>(null);
  readonly submitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<HotelFormValue>();
  readonly cancelled = output<void>();

  protected readonly locations = signal<Location[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: this.fb.control<string | null>(null),
    starRating: [3, Validators.required],
    imageUrl: this.fb.control<string | null>(null),
    isActive: [true],
    locationId: ['', Validators.required],
  });

  constructor() {
    this.locationService.listAllForDropdown().then((locations) => this.locations.set(locations));

    effect(() => {
      const value = this.initialValue();
      this.form.reset(
        value ?? { name: '', description: null, starRating: 3, imageUrl: null, isActive: true, locationId: '' }
      );
    });
  }

  protected isInvalid(name: 'name' | 'locationId'): boolean {
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
