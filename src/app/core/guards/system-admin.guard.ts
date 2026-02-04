/**
 * System Admin Guard
 * Protects routes that require ROLE_SYSTEM_ADMIN authority
 *
 * Usage:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [SystemAdminGuard]
 * }
 */

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('SystemAdminGuard: User not authenticated, redirecting to login');
      // Redirect to login and preserve the attempted URL
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Check if user has ROLE_SYSTEM_ADMIN
    if (!this.authService.isSystemAdmin()) {
      console.warn('SystemAdminGuard: User lacks ROLE_SYSTEM_ADMIN authority');
      const user = this.authService.currentUserValue;
      console.warn('User authorities:', user?.authorities);

      // User is authenticated but doesn't have system admin role
      // Could redirect to an "access denied" page or back to login
      return this.router.createUrlTree(['/access-denied']);
    }

    // User is authenticated and has ROLE_SYSTEM_ADMIN
    return true;
  }
}
