import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
}

export interface UserSummary {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  tenant_name?: string;
  tenant?: Tenant; // Nested tenant object from backend
  username: string;
  email: string;
  full_name?: string;
  firstName?: string; // Alternative field names from backend
  lastName?: string;
  is_active?: boolean;
  isActive?: boolean; // Alternative field name from backend (camelCase)
  enabled?: boolean; // Another possible field name
  is_system_admin?: boolean;
  is_tenant_admin?: boolean;
  roles?: string[] | Role[]; // Can be array of strings or array of role objects
  created_at?: string;
  createdAt?: string; // Alternative field name from backend
  last_login_at?: string | null;
  lastLoginAt?: string | null; // Alternative field name from backend
  isEmailVerified?: boolean;
}

export interface UserDetail extends UserSummary {
  authorities?: string[];
  phone?: string;
  avatar_url?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  tenantId?: string;
  role?: string;
  status?: 'all' | 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface AssignRoleRequest {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of users across all tenants
   */
  getUsers(params: UserListParams = {}): Observable<ApiResponse<UserSummary[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 20).toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.tenantId) {
      httpParams = httpParams.set('tenantId', params.tenantId);
    }

    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }

    if (params.status && params.status !== 'all') {
      const isActive = params.status === 'active';
      httpParams = httpParams.set('isActive', isActive.toString());
    }

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }

    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<ApiResponse<UserSummary[]>>(
      `${this.apiUrl}/admin/users`,
      { params: httpParams }
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.apiUrl}/admin/users/${userId}`);
  }

  /**
   * Update user
   */
  updateUser(userId: string, updates: UpdateUserRequest): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.apiUrl}/admin/users/${userId}`, updates);
  }

  /**
   * Activate user
   */
  activateUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/users/${userId}/activate`, {});
  }

  /**
   * Suspend user
   */
  suspendUser(userId: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/users/${userId}/suspend`, { reason });
  }

  /**
   * Assign ROLE_SYSTEM_ADMIN to user
   */
  assignSystemAdminRole(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/users/${userId}/assign-system-admin`, {});
  }

  /**
   * Remove ROLE_SYSTEM_ADMIN from user
   */
  removeSystemAdminRole(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${userId}/remove-system-admin`);
  }

  /**
   * Reset user password (admin action)
   */
  resetPassword(userId: string): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(
      `${this.apiUrl}/admin/users/${userId}/reset-password`,
      {}
    );
  }

  /**
   * Delete user (soft delete)
   */
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${userId}`);
  }
}
