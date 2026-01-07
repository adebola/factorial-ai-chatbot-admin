import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  user_id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  tenant_domain: string;
  tenant_name: string;
  roles: string[];
  permissions: string[];
  is_tenant_admin: boolean;
  token: string;
}

export interface JWTPayload {
  iss: string;
  sub: string;
  aud: string[];
  exp: number;
  iat: number;
  organization: string;
  platform: string;
  tenant_id: string;
  user_id: string;
  tenant_domain: string;
  roles: string[];
  permissions: string[];
  authorities: string[];
  email: string;
  full_name: string;
  is_tenant_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Initiates OAuth2 authorization code flow
   */
  login(): void {
    const returnUrl = this.getReturnUrl() || '/dashboard';
    this.setReturnUrl(returnUrl);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: environment.oauth2.clientId,
      redirect_uri: environment.oauth2.redirectUri,
      scope: environment.oauth2.scope,
      state: this.generateState()
    });

    window.location.href = `${environment.oauth2.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for tokens
   */
  exchangeCodeForToken(code: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.oauth2.clientId}:${environment.oauth2.clientSecret}`)
    });

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: environment.oauth2.redirectUri,
      client_id: environment.oauth2.clientId
    });

    return this.http.post(environment.oauth2.tokenUrl, body.toString(), { headers })
      .pipe(map((response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          if (response.id_token) {
            localStorage.setItem('id_token', response.id_token);
          }
          this.hydrateUserFromToken(response.access_token);
        }
        return response;
      }));
  }

  /**
   * Refreshes access token using refresh token
   */
  refreshAccessToken(refreshToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.oauth2.clientId}:${environment.oauth2.clientSecret}`)
    });

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: environment.oauth2.clientId
    });

    return this.http.post(environment.oauth2.tokenUrl, body.toString(), { headers })
      .pipe(map((response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          this.hydrateUserFromToken(response.access_token);
        }
        return response;
      }));
  }

  /**
   * Logs out the user
   */
  logout(isUserInitiated: boolean = false): void {
    const token = this.getToken();

    if (isUserInitiated) {
      sessionStorage.setItem('intentional_logout', 'true');
    }

    // Revoke token on server
    if (token) {
      this.revokeToken(token).subscribe({
        error: (err) => console.error('Error revoking token:', err)
      });
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_return_url');

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Revokes a token on the server
   */
  revokeToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.oauth2.clientId}:${environment.oauth2.clientSecret}`)
    });

    const body = new URLSearchParams({
      token: token,
      token_type_hint: 'access_token'
    });

    return this.http.post(environment.oauth2.revocationUrl, body.toString(), { headers });
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeJWT(token);
      const isExpired = this.isTokenExpired(payload);
      return !isExpired;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets current access token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Gets refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Gets ID token
   */
  getIdToken(): string | null {
    return localStorage.getItem('id_token');
  }

  /**
   * Gets current user
   */
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  /**
   * Checks if refresh token is valid
   */
  isRefreshTokenValid(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const payload = this.decodeJWT(refreshToken);
      return !this.isTokenExpired(payload);
    } catch (error) {
      return false;
    }
  }

  /**
   * Decodes JWT token
   */
  private decodeJWT(token: string): JWTPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  /**
   * Checks if token is expired
   */
  private isTokenExpired(payload: JWTPayload): boolean {
    if (!payload.exp) {
      return true;
    }

    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
  }

  /**
   * Hydrates user from token
   */
  private hydrateUserFromToken(token: string): void {
    try {
      const payload = this.decodeJWT(token);
      const user: User = {
        user_id: payload.user_id,
        tenant_id: payload.tenant_id,
        email: payload.email,
        full_name: payload.full_name,
        tenant_domain: payload.tenant_domain,
        tenant_name: payload.organization,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        is_tenant_admin: payload.is_tenant_admin || false,
        token: token
      };

      localStorage.setItem('user_info', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error hydrating user from token:', error);
    }
  }

  /**
   * Gets user from storage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user_info');
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generates random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Sets return URL
   */
  setReturnUrl(url: string): void {
    localStorage.setItem('auth_return_url', url);
  }

  /**
   * Gets return URL
   */
  getReturnUrl(): string | null {
    return localStorage.getItem('auth_return_url');
  }

  /**
   * Clears return URL
   */
  clearReturnUrl(): void {
    localStorage.removeItem('auth_return_url');
  }
}