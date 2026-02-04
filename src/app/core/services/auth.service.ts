/**
 * Authentication Service
 * Handles OAuth2 authentication for ChatCraft Super Admin
 *
 * Features:
 * - OAuth2 Authorization Code flow with client_secret authentication
 * - JWT token management
 * - ROLE_SYSTEM_ADMIN validation
 * - Token refresh
 * - Session management
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { User, TokenPayload, TokenResponse } from '../models/user.model';
import { STORAGE_KEYS, USER_ROLES } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenRefreshTimer: any;
  private isHandlingCallback = false;
  private requestCounter = 0;
  private refreshInProgress$: Observable<User> | null = null;
  private isLoggingOut = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize current user from storage
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Set up automatic token refresh if user is logged in
    if (storedUser && storedUser.token) {
      this.scheduleTokenRefresh(storedUser.token);
    }
  }

  /**
   * Get current user value
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      return false;
    }

    // Check if token is expired
    if (user.token_expires_at && user.token_expires_at < Date.now()) {
      // If we have a refresh token, let the interceptor handle refresh
      // Don't immediately logout
      if (user.refresh_token) {
        return true;  // Let interceptor trigger refresh on next API call
      }
      // Only logout if no refresh token available
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Check if current user is a system admin
   */
  public isSystemAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.is_system_admin || false;
  }

  /**
   * Initiate OAuth2 login flow (Authorization Code flow)
   */
  public login(): void {
    // Build authorization URL (without PKCE)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: environment.oauth2.clientId,
      redirect_uri: environment.oauth2.redirectUri,
      scope: environment.oauth2.scope,
      state: this.generateRandomState()
    });

    const authUrl = `${environment.oauth2.authorizationUrl}?${params.toString()}`;

    // Redirect to authorization server
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth2 callback and exchange code for token
   */
  public handleCallback(code: string, state: string): Observable<User> {
    console.log('[AuthService] handleCallback called at', new Date().toISOString(), 'isHandlingCallback:', this.isHandlingCallback);
    // Guard against duplicate calls
    if (this.isHandlingCallback) {
      console.warn('[AuthService] Token exchange already in progress, ignoring duplicate call');
      return throwError(() => new Error('Token exchange already in progress'));
    }

    this.isHandlingCallback = true;
    console.log('[AuthService] Set isHandlingCallback = true, proceeding with token exchange');

    // Create Basic Authentication credentials
    const credentials = btoa(`${environment.oauth2.clientId}:${environment.oauth2.clientSecret}`);

    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    // Exchange authorization code for tokens
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', environment.oauth2.redirectUri)
      .set('client_id', environment.oauth2.clientId)
      .set('client_secret', environment.oauth2.clientSecret);

    this.requestCounter++;
    const requestId = this.requestCounter;
    console.log(`[AuthService] Making POST request to token endpoint [Request #${requestId}]`);
    return this.http.post<TokenResponse>(
      environment.oauth2.tokenUrl,
      body.toString(),
      { headers }
    ).pipe(
      finalize(() => {
        console.log(`[AuthService] Resetting isHandlingCallback = false [Request #${requestId}]`);
        this.isHandlingCallback = false;
      }),
      map(response => {
        // Process token and create user object
        return this.processTokenResponse(response);
      }),
      tap(user => {
        // Validate system admin authority
        if (!user.is_system_admin) {
          throw new Error('Access denied: ROLE_SYSTEM_ADMIN required');
        }

        // Store user and schedule token refresh
        this.setCurrentUser(user);
        this.scheduleTokenRefresh(user.token);
      }),
      catchError(error => {
        console.error('Token exchange failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token using refresh token
   */
  public refreshToken(): Observable<User> {
    // If refresh already in progress, return the same observable
    if (this.refreshInProgress$) {
      console.log('[AuthService] Refresh already in progress, returning existing observable');
      return this.refreshInProgress$;
    }

    const user = this.currentUserValue;
    if (!user || !user.refresh_token) {
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('[AuthService] Starting new token refresh');

    const credentials = btoa(`${environment.oauth2.clientId}:${environment.oauth2.clientSecret}`);
    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', user.refresh_token)
      .set('client_id', environment.oauth2.clientId)
      .set('client_secret', environment.oauth2.clientSecret);

    this.refreshInProgress$ = this.http.post<TokenResponse>(
      environment.oauth2.tokenUrl,
      body.toString(),
      { headers }
    ).pipe(
      map(response => this.processTokenResponse(response)),
      tap(updatedUser => {
        console.log('[AuthService] Token refresh successful');
        this.setCurrentUser(updatedUser);
        this.scheduleTokenRefresh(updatedUser.token);
      }),
      catchError(error => {
        console.error('[AuthService] Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        console.log('[AuthService] Resetting refreshInProgress$ to null');
        this.refreshInProgress$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshInProgress$;
  }

  /**
   * Logout user
   */
  public logout(): void {
    // Guard against multiple simultaneous logout calls
    if (this.isLoggingOut) {
      console.log('[AuthService] Logout already in progress, ignoring duplicate call');
      return;
    }

    this.isLoggingOut = true;
    console.log('[AuthService] Starting logout process');

    const user = this.currentUserValue;

    // Cancel token refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    // Cancel any in-progress refresh
    if (this.refreshInProgress$) {
      console.log('[AuthService] Cancelling in-progress token refresh');
      this.refreshInProgress$ = null;
    }

    // Revoke token on server (only if we have a valid token)
    if (user && user.token) {
      const credentials = btoa(`${environment.oauth2.clientId}:${environment.oauth2.clientSecret}`);
      const headers = new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      const body = new HttpParams()
        .set('token', user.token)
        .set('token_type_hint', 'access_token');

      // Fire and forget - don't wait for revocation to complete
      this.http.post(
        environment.oauth2.revocationUrl,
        body.toString(),
        { headers }
      ).subscribe({
        next: () => console.log('[AuthService] Token revoked successfully'),
        error: (err) => console.error('[AuthService] Token revocation failed:', err),
        complete: () => {
          // Reset logout flag after revocation completes (or fails)
          this.isLoggingOut = false;
        }
      });
    } else {
      // No token to revoke, just reset the flag
      this.isLoggingOut = false;
    }

    // Clear storage and user immediately (don't wait for revocation)
    this.clearStorage();
    this.currentUserSubject.next(null);

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  /**
   * Process token response and create user object
   */
  private processTokenResponse(response: TokenResponse): User {
    const payload = this.decodeToken(response.access_token);

    // Calculate token expiration
    const expiresAt = Date.now() + (response.expires_in * 1000);

    // Extract authorities and determine admin status
    const authorities = payload.authorities || [];
    const is_system_admin = authorities.includes(USER_ROLES.SYSTEM_ADMIN);
    const is_tenant_admin = authorities.includes(USER_ROLES.TENANT_ADMIN);

    const user: User = {
      user_id: payload.sub,
      tenant_id: payload.tenant_id,
      email: payload.email,
      full_name: payload.full_name,
      roles: payload.roles || [],
      authorities: authorities,
      is_system_admin: is_system_admin,
      is_tenant_admin: is_tenant_admin,
      token: response.access_token,
      refresh_token: response.refresh_token,
      token_expires_at: expiresAt
    };

    return user;
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      throw new Error('Invalid token format');
    }
  }

  /**
   * Set current user and persist to storage
   */
  private setCurrentUser(user: User): void {
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, user.token);
    if (user.refresh_token) {
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, user.refresh_token);
    }
    this.currentUserSubject.next(user);
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): User | null {
    const userJson = sessionStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  }

  /**
   * Clear all storage
   */
  private clearStorage(): void {
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(token: string): void {
    // Cancel existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    try {
      const payload = this.decodeToken(token);
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const refreshTime = expiresAt - now - environment.oauth2.refreshTokenBeforeExpiry;

      if (refreshTime > 0) {
        console.log(`[AuthService] Scheduling auto-refresh in ${Math.round(refreshTime / 1000)}s`);
        this.tokenRefreshTimer = setTimeout(() => {
          // Only auto-refresh if no manual refresh is in progress
          if (!this.refreshInProgress$) {
            console.log('[AuthService] Auto-refreshing token...');
            this.refreshToken().subscribe({
              next: () => console.log('[AuthService] Auto token refresh successful'),
              error: (err) => console.error('[AuthService] Auto token refresh failed:', err)
            });
          } else {
            console.log('[AuthService] Skipping auto-refresh, manual refresh in progress');
          }
        }, refreshTime);
      } else {
        console.warn('[AuthService] Token already expired, not scheduling refresh');
      }
    } catch (error) {
      console.error('[AuthService] Failed to schedule token refresh:', error);
    }
  }

  /**
   * Generate random state parameter
   */
  private generateRandomState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
