import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

interface Notification {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'New user registered: Priya Sharma', time: '2m ago', read: false },
  { id: 2, title: 'Order #4821 marked as delayed', time: '1h ago', read: false },
  { id: 3, title: 'Weekly report is ready to view', time: 'Yesterday', read: true },
];

const LANGUAGES = ['English', 'Español', 'Français', 'বাংলা'];

type Panel = 'notifications' | 'profile' | 'language' | null;

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
        (click)="toggleSidebar.emit()"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div class="relative hidden max-w-sm flex-1 sm:block">
        <input
          type="search"
          placeholder="Search anything…"
          class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          (click)="theme.toggle()"
          [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ theme.theme() === 'dark' ? '☀️' : '🌙' }}
        </button>

        <div class="relative">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            (click)="togglePanel('language')"
            aria-label="Change language"
          >
            🌐
          </button>
          @if (openPanel() === 'language') {
            <div class="absolute right-0 top-11 z-20 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              @for (lang of languages; track lang) {
                <button type="button" class="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700" (click)="openPanel.set(null)">
                  {{ lang }}
                </button>
              }
            </div>
          }
        </div>

        <div class="relative">
          <button
            type="button"
            class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            (click)="togglePanel('notifications')"
            aria-label="Notifications"
          >
            🔔
            @if (unreadCount() > 0) {
              <span class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {{ unreadCount() }}
              </span>
            }
          </button>
          @if (openPanel() === 'notifications') {
            <div class="absolute right-0 top-11 z-20 w-72 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div class="border-b border-slate-100 px-4 py-2 text-sm font-semibold dark:border-slate-700">Notifications</div>
              @for (n of notifications(); track n.id) {
                <div class="flex items-start gap-2 border-b border-slate-50 px-4 py-2.5 last:border-0 dark:border-slate-700/50">
                  @if (!n.read) {
                    <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"></span>
                  }
                  <div>
                    <p class="text-sm text-slate-700 dark:text-slate-200">{{ n.title }}</p>
                    <p class="text-xs text-slate-400">{{ n.time }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            (click)="togglePanel('profile')"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {{ initials() }}
            </span>
          </button>
          @if (openPanel() === 'profile') {
            <div class="absolute right-0 top-11 z-20 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div class="border-b border-slate-100 px-4 py-2 text-sm dark:border-slate-700">
                <p class="font-medium text-slate-800 dark:text-slate-100">{{ auth.user()?.firstName }} {{ auth.user()?.lastName }}</p>
                <p class="truncate text-xs text-slate-400">{{ auth.user()?.email }}</p>
              </div>
              <button type="button" class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700" (click)="signOut()">Sign out</button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly toggleSidebar = output<void>();

  protected readonly languages = LANGUAGES;
  protected readonly notifications = signal(DEMO_NOTIFICATIONS);
  protected readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  protected readonly initials = computed(() => {
    const user = this.auth.user();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  protected readonly openPanel = signal<Panel>(null);

  protected togglePanel(panel: Panel): void {
    this.openPanel.set(this.openPanel() === panel ? null : panel);
  }

  protected async signOut(): Promise<void> {
    this.openPanel.set(null);
    await this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
