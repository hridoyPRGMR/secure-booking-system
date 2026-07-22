import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PermissionAreaGroup, PermissionCatalogItem } from '../models/permission.model';
import { RoleFormValue } from '../models/role.model';
import { PermissionService } from '../services/permission.service';

@Component({
  selector: 'app-role-form',
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
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <input
          type="text"
          formControlName="description"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-indigo-500 dark:bg-slate-900"
          [class.border-red-400]="isInvalid('description')"
          [class.border-slate-300]="!isInvalid('description')"
          [class.dark:border-slate-600]="!isInvalid('description')"
        />
        @if (isInvalid('description')) {
          <p class="mt-1 text-xs text-red-500">Description is required.</p>
        }
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Permissions</label>
          @if (selectedCount() === 0) {
            <span class="text-xs text-red-500">Select at least one permission.</span>
          } @else {
            <span class="text-xs text-slate-400">{{ selectedCount() }} selected</span>
          }
        </div>

        @if (permissionsLoading()) {
          <p class="text-sm text-slate-400">Loading permissions…</p>
        } @else {
          <div class="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600">
            @for (group of permissionGroups(); track group.area) {
              <div>
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {{ group.area }}
                  </span>
                  <button
                    type="button"
                    class="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    (click)="toggleArea(group)"
                  >
                    {{ isAreaFullySelected(group) ? 'Clear all' : 'Select all' }}
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  @for (permission of group.permissions; track permission.code) {
                    <label class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        [checked]="isSelected(permission.code)"
                        (change)="togglePermission(permission.code)"
                      />
                      {{ permission.action }}
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        }
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
          {{ mode() === 'edit' ? 'Save changes' : 'Add role' }}
        </button>
      </div>
    </form>
  `,
})
export class RoleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly permissionService = inject(PermissionService);

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<RoleFormValue | null>(null);
  readonly submitting = input<boolean>(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<RoleFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(300)]],
  });

  private readonly catalog = signal<PermissionCatalogItem[]>([]);
  protected readonly permissionsLoading = signal(true);
  private readonly selectedPermissions = signal<ReadonlySet<string>>(new Set());

  protected readonly permissionGroups = computed<PermissionAreaGroup[]>(() => {
    const byArea = new Map<string, PermissionCatalogItem[]>();
    for (const item of this.catalog()) {
      const list = byArea.get(item.area) ?? [];
      list.push(item);
      byArea.set(item.area, list);
    }
    return [...byArea.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([area, permissions]) => ({ area, permissions }));
  });

  protected readonly selectedCount = computed(() => this.selectedPermissions().size);

  constructor() {
    this.permissionService.list().subscribe({
      next: (items) => {
        this.catalog.set(items);
        this.permissionsLoading.set(false);
      },
      error: () => this.permissionsLoading.set(false),
    });

    effect(() => {
      const value = this.initialValue();
      this.form.reset(value ? { name: value.name, description: value.description } : { name: '', description: '' });
      this.selectedPermissions.set(new Set(value?.permissionCodes ?? []));
    });
  }

  protected isInvalid(name: 'name' | 'description'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected isSelected(code: string): boolean {
    return this.selectedPermissions().has(code);
  }

  protected togglePermission(code: string): void {
    const next = new Set(this.selectedPermissions());
    next.has(code) ? next.delete(code) : next.add(code);
    this.selectedPermissions.set(next);
  }

  protected isAreaFullySelected(group: PermissionAreaGroup): boolean {
    return group.permissions.every((p) => this.selectedPermissions().has(p.code));
  }

  protected toggleArea(group: PermissionAreaGroup): void {
    const next = new Set(this.selectedPermissions());
    const fullySelected = this.isAreaFullySelected(group);
    for (const permission of group.permissions) {
      fullySelected ? next.delete(permission.code) : next.add(permission.code);
    }
    this.selectedPermissions.set(next);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.selectedCount() === 0) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit({ ...this.form.getRawValue(), permissionCodes: [...this.selectedPermissions()] });
  }
}
