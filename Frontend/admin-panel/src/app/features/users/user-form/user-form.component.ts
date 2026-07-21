import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserFormValue } from '../models/user.model';

@Component({
  selector: 'app-user-form',
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
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">First name</label>
          <input
            type="text"
            formControlName="firstName"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('firstName')"
            [class.border-slate-300]="!isInvalid('firstName')"
          />
          @if (isInvalid('firstName')) {
            <p class="mt-1 text-xs text-red-500">First name is required.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Last name</label>
          <input
            type="text"
            formControlName="lastName"
            class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
            [class.border-red-400]="isInvalid('lastName')"
            [class.border-slate-300]="!isInvalid('lastName')"
          />
          @if (isInvalid('lastName')) {
            <p class="mt-1 text-xs text-red-500">Last name is required.</p>
          }
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <input
          type="email"
          formControlName="email"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('email')"
          [class.border-slate-300]="!isInvalid('email')"
        />
        @if (form.controls.email.hasError('required') && form.controls.email.touched) {
          <p class="mt-1 text-xs text-red-500">Email is required.</p>
        } @else if (form.controls.email.hasError('email') && form.controls.email.touched) {
          <p class="mt-1 text-xs text-red-500">Enter a valid email address.</p>
        }
      </div>

      @if (mode() === 'create') {
        <p class="text-xs text-slate-400">
          A temporary password will be generated automatically — you'll be shown it once after the user is created.
        </p>
      }

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
          {{ mode() === 'edit' ? 'Save changes' : 'Add user' }}
        </button>
      </div>
    </form>
  `,
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<UserFormValue | null>(null);
  readonly submitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<UserFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      this.form.reset(value ?? { firstName: '', lastName: '', email: '' });
    });
  }

  protected isInvalid(name: 'firstName' | 'lastName' | 'email'): boolean {
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
