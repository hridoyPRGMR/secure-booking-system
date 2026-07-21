import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationFormValue } from '../models/location.model';

@Component({
  selector: 'app-location-form',
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
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
          <input
            type="text"
            formControlName="city"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('city')"
            [class.border-slate-300]="!isInvalid('city')"
            [class.dark:border-slate-600]="!isInvalid('city')"
          />
          @if (isInvalid('city')) {
            <p class="mt-1 text-xs text-red-500">City is required.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
          <input
            type="text"
            formControlName="country"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('country')"
            [class.border-slate-300]="!isInvalid('country')"
            [class.dark:border-slate-600]="!isInvalid('country')"
          />
          @if (isInvalid('country')) {
            <p class="mt-1 text-xs text-red-500">Country is required.</p>
          }
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
        <input
          type="text"
          formControlName="address"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('address')"
          [class.border-slate-300]="!isInvalid('address')"
          [class.dark:border-slate-600]="!isInvalid('address')"
        />
        @if (isInvalid('address')) {
          <p class="mt-1 text-xs text-red-500">Address is required.</p>
        }
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Latitude (optional)</label>
          <input
            type="number"
            step="any"
            formControlName="latitude"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Longitude (optional)</label>
          <input
            type="number"
            step="any"
            formControlName="longitude"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
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
          {{ mode() === 'edit' ? 'Save changes' : 'Add location' }}
        </button>
      </div>
    </form>
  `,
})
export class LocationFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<LocationFormValue | null>(null);
  readonly submitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<LocationFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    city: ['', [Validators.required, Validators.maxLength(100)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
    address: ['', [Validators.required, Validators.maxLength(300)]],
    latitude: this.fb.control<number | null>(null),
    longitude: this.fb.control<number | null>(null),
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      this.form.reset(value ?? { city: '', country: '', address: '', latitude: null, longitude: null });
    });
  }

  protected isInvalid(name: 'city' | 'country' | 'address'): boolean {
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
