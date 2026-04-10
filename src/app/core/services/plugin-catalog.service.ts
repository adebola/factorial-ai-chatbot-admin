/**
 * Plugin Catalog Service
 *
 * Reads the dynamic plugin/agentic-service UI extensions from billing-service
 * via the gateway. The superadmin shell calls this on bootstrap to render menu
 * entries contributed by installed plugins (e.g. observability, legal, etc.)
 * instead of hardcoding them in the layout component.
 *
 * Caches the result in memory so the layout doesn't refetch on every navigation.
 * The Services admin feature should call `refresh()` after add/remove so menus
 * stay in sync without a page reload.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface PluginUiExtension {
  service_id: string;
  service_key: string;
  service_name: string;
  menu_label: string;
  icon: string | null;
  route: string;
  required_role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'ANY';
  api_prefix: string | null;
  health_status: 'healthy' | 'unhealthy' | 'unknown';
}

@Injectable({
  providedIn: 'root',
})
export class PluginCatalogService {
  private readonly endpoint = `${environment.apiUrl}/admin/services/ui-extensions`;

  private readonly extensions$ = new BehaviorSubject<PluginUiExtension[]>([]);
  private loaded = false;
  private inflight$: Observable<PluginUiExtension[]> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Stream of currently-known UI extensions. Emits the cached list immediately
   * and re-emits on `refresh()`. Most consumers should prefer `load()`, which
   * resolves to the loaded value once and is race-free for guards.
   */
  get uiExtensions$(): Observable<PluginUiExtension[]> {
    return this.extensions$.asObservable();
  }

  /**
   * Load the UI extensions from the catalog. Behavior:
   *   - If already loaded, returns the cached value as a one-shot observable.
   *   - If a fetch is in flight, returns that observable (concurrent callers
   *     share the same HTTP request).
   *   - Otherwise issues a new HTTP request, populates the BehaviorSubject,
   *     and marks the cache loaded.
   *
   * On error returns an empty list — a missing/unreachable catalog must NOT
   * break route guards. Direct navigation will fall through to the catalog's
   * "no entry" branch and redirect to /dashboard.
   */
  load(): Observable<PluginUiExtension[]> {
    if (this.loaded) {
      return of(this.extensions$.value);
    }
    if (this.inflight$) {
      return this.inflight$;
    }

    this.inflight$ = this.http.get<PluginUiExtension[]>(this.endpoint).pipe(
      catchError((err) => {
        console.warn(
          '[PluginCatalogService] failed to load ui-extensions, falling back to empty list',
          err,
        );
        return of<PluginUiExtension[]>([]);
      }),
      tap((list) => {
        this.extensions$.next(list ?? []);
        this.loaded = true;
        this.inflight$ = null;
      }),
      shareReplay(1),
    );

    return this.inflight$;
  }

  /** Force a refresh — call after add/remove in the Services admin page. */
  refresh(): Observable<PluginUiExtension[]> {
    this.loaded = false;
    this.inflight$ = null;
    return this.load();
  }

  /** Look up an extension by its `route` (e.g. `'observability'`). */
  hasRoute(route: string): boolean {
    return this.extensions$.value.some((ext) => ext.route === route);
  }
}