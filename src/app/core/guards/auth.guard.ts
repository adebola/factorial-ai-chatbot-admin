/**
 * Auth Guard
 * Protects routes that require authentication (but not necessarily ROLE_SYSTEM_ADMIN)
 *
 * Usage:
 * {
 *   path: 'profile',
 *   component: ProfileComponent,
 *   canActivate: [AuthGuard]
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
export class AuthGuard implements CanActivate {
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
      console.warn('AuthGuard: User not authenticated, redirecting to login');
      // Redirect to login and preserve the attempted URL
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // User is authenticated
    return true;
  }
}
