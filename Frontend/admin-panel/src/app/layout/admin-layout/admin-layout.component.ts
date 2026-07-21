import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';
import { NAV_ITEMS } from '../nav-item.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, BreadcrumbComponent, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <app-sidebar [items]="navItems" [collapsed]="sidebarCollapsed()" />

      <div class="flex flex-1 flex-col overflow-hidden">
        <app-header (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />

        <main class="flex-1 overflow-y-auto p-6">
          <div class="mb-4">
            <app-breadcrumb />
          </div>
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast-container />
  `,
})
export class AdminLayoutComponent {
  protected readonly navItems = NAV_ITEMS;
  protected readonly sidebarCollapsed = signal(false);
}
