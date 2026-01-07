import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export function resetAuthInterceptorState(): void {
  isRefreshing = false;
  refreshTokenSubject.next(null);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip authentication for OAuth2 endpoints and public routes
  const skipAuth = [
    '/auth/oauth2',
    '/auth/register',
    '/auth/login',
    '/auth/invitation',
    '/plans/public'
  ].some(url => req.url.includes(url));

  if (skipAuth) {
    return next(req);
  }

  // Add authorization header
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/oauth2')) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: any, next: any, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken && authService.isRefreshTokenValid()) {
      return authService.refreshAccessToken(refreshToken).pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.access_token);

          // Retry the failed request with new token
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.access_token}`
            }
          });
          return next(req);
        }),
        catchError((err) => {
          isRefreshing = false;
          authService.logout(false);
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      authService.logout(false);
      return throwError(() => new Error('Refresh token invalid or missing'));
    }
  } else {
    // Wait for token refresh to complete
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(req);
      })
    );
  }
}