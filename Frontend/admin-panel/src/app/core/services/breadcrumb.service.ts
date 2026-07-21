import { Injectable, computed, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';

export interface Breadcrumb {
  label: string;
  url: string;
}

/**
 * Walks the activated route tree on every NavigationEnd and resolves a
 * breadcrumb trail from each segment's `data.breadcrumb`.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _trail = signal<Breadcrumb[]>([]);
  readonly trail = computed(() => this._trail());

  constructor(private readonly router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._trail.set(this.buildTrail(this.router.routerState.snapshot.root));
      }
    });
  }

  private buildTrail(snapshot: ActivatedRouteSnapshot): Breadcrumb[] {
    const crumbs: Breadcrumb[] = [{ label: 'Home', url: '/' }];
    let node: ActivatedRouteSnapshot | null = snapshot;
    let url = '';

    while (node) {
      const segment = node.url.map((s) => s.path).join('/');
      if (segment) url += `/${segment}`;

      const label = node.data['breadcrumb'] as string | undefined;
      if (label) crumbs.push({ label, url: url || '/' });

      node = node.firstChild;
    }

    return crumbs;
  }
}
