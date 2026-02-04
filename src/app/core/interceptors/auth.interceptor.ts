/**
 * Authentication Interceptor
 * Automatically adds Authorization header to all HTTP requests
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('[AuthInterceptor] Intercepting request:', request.method, request.url);

    // Skip adding token for OAuth2 endpoints (token, authorization, revocation)
    if (request.url.includes(environment.oauth2.tokenUrl) ||
        request.url.includes(environment.oauth2.authorizationUrl) ||
        request.url.includes(environment.oauth2.revocationUrl)) {
      console.log('[AuthInterceptor] Skipping OAuth2 endpoint');
      return next.handle(request);
    }

    // Get access token
    const token = this.authService.getAccessToken();

    // Clone request and add Authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch 401 errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.authService.isAuthenticated()) {
          // Token might be expired, try to refresh
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Handle 401 Unauthorized errors by refreshing token
   */
  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    console.log('[AuthInterceptor] Handling 401 error for:', request.url);

    // Call refreshToken() - it will return existing observable if refresh in progress
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        console.log('[AuthInterceptor] Token refreshed, retrying request:', request.url);
        // Retry request with new token
        const newToken = this.authService.getAccessToken();
        if (newToken) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
        }
        return next.handle(request);
      }),
      catchError((error) => {
        console.error('[AuthInterceptor] Token refresh failed, user will be logged out');
        // Refresh failed - authService.refreshToken() already called logout()
        // Just propagate the error
        return throwError(() => error);
      })
    );
  }
}
