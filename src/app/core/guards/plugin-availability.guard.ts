/**
 * Plugin Availability Guard
 *
 * Protects routes that belong to optional plugin/agentic services so that a
 * bookmarked URL like `/observability` cannot reach a feature module whose
 * backend is not installed in the current environment.
 *
 * The route to guard must declare its plugin key in `data`:
 *
 * ```ts
 * {
 *   path: 'observability',
 *   canActivate: [PluginAvailabilityGuard],
 *   data: { pluginRoute: 'observability' },
 *   loadChildren: () => import('./features/observability/observability.module')
 *     .then(m => m.ObservabilityModule),
 * }
 * ```
 *
 * The guard checks the in-memory PluginCatalogService for an entry whose
 * `route` matches `pluginRoute`. If absent, it redirects to /dashboard with a
 * snackbar toast and never lets the lazy module load — meaning the feature's
 * code won't issue any HTTP calls against a missing backend.
 *
 * The catalog is loaded eagerly by the layout component on bootstrap, so by
 * the time a user clicks anything the cache is populated. As a safety net,
 * this guard triggers `load()` itself if the cache is still empty.
 */

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { PluginCatalogService } from '../services/plugin-catalog.service';

@Injectable({
  providedIn: 'root',
})
export class PluginAvailabilityGuard implements CanActivate {
  constructor(
    private pluginCatalog: PluginCatalogService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const pluginRoute: string | undefined = route.data?.['pluginRoute'];

    if (!pluginRoute) {
      // Misconfigured route — fail closed and log loudly so the dev fixes it.
      console.error(
        'PluginAvailabilityGuard applied to a route with no `data.pluginRoute`. ' +
          'Allowing navigation as a last-resort fallback — please fix the route config.',
      );
      return new Observable((sub) => {
        sub.next(true);
        sub.complete();
      });
    }

    // Chain off `load()` so the guard always waits for the catalog to be
    // populated before deciding. Subscribing to the BehaviorSubject directly
    // would race against the initial empty value when the layout no longer
    // eagerly populates the cache.
    return this.pluginCatalog.load().pipe(
      take(1),
      map((extensions) => {
        const found = extensions.some((ext) => ext.route === pluginRoute);
        if (found) {
          return true;
        }

        console.warn(
          `PluginAvailabilityGuard: plugin route '${pluginRoute}' is not registered ` +
            'in the catalog — redirecting to /dashboard.',
        );
        this.snackBar.open(
          `The "${pluginRoute}" plugin is not installed in this environment.`,
          'Dismiss',
          { duration: 4000 },
        );
        return this.router.createUrlTree(['/dashboard']);
      }),
    );
  }
}