import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-900">
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <h1 class="mb-1 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h1>
        <p class="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">Sign in to manage the workspace.</p>

        @if (generalError()) {
          <div class="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950 dark:text-red-300">
            {{ generalError() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || submitting()"
            class="mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (submitting()) {
              <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            }
            Sign in
          </button>
        </form>
      </div>
    </div>
  `,
})
export default class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly generalError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.generalError.set(null);

    const { email, password } = this.form.getRawValue();
    const result = await this.auth.login(email, password);

    this.submitting.set(false);

    if (result.success) {
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/users';
      this.router.navigateByUrl(redirectTo);
    } else {
      this.generalError.set(result.message ?? 'Invalid email or password.');
    }
  }
}
