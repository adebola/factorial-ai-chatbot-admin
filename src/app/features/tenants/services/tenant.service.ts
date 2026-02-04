import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Tenant, TenantSummary, TenantDetail, UpdateTenantRequest } from '../../../core/models/tenant.model';

export interface TenantListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: 'all' | 'active' | 'suspended';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TenantStatistics {
  total_users: number;
  active_users: number;
  total_chats: number;
  total_messages: number;
  num_documents: number;
  num_websites: number;
  storage_used_mb: number;
  last_activity: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of tenants
   */
  getTenants(params: TenantListParams = {}): Observable<ApiResponse<TenantSummary[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 20).toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
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

    return this.http.get<ApiResponse<TenantSummary[]>>(
      `${this.apiUrl}/admin/tenants`,
      { params: httpParams }
    );
  }

  /**
   * Get tenant by ID with full details
   */
  getTenantById(tenantId: string): Observable<TenantDetail> {
    return this.http.get<TenantDetail>(`${this.apiUrl}/admin/tenants/${tenantId}`);
  }

  /**
   * Create new tenant
   */
  createTenant(tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/admin/tenants`, tenant);
  }

  /**
   * Update tenant
   */
  updateTenant(tenantId: string, updates: UpdateTenantRequest): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/admin/tenants/${tenantId}`, updates);
  }

  /**
   * Activate tenant
   */
  activateTenant(tenantId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/tenants/${tenantId}/activate`, {});
  }

  /**
   * Suspend tenant
   */
  suspendTenant(tenantId: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/tenants/${tenantId}/suspend`, { reason });
  }

  /**
   * Delete tenant (soft delete)
   */
  deleteTenant(tenantId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/tenants/${tenantId}`);
  }

  /**
   * Get tenant statistics
   */
  getTenantStatistics(tenantId: string): Observable<TenantStatistics> {
    return this.http.get<TenantStatistics>(`${this.apiUrl}/admin/tenants/${tenantId}/statistics`);
  }

  /**
   * Get tenant subscription
   */
  getTenantSubscription(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/billing/subscriptions/tenant/${tenantId}`);
  }

  /**
   * Regenerate tenant API key
   */
  regenerateApiKey(tenantId: string): Observable<{ apiKey: string }> {
    return this.http.post<{ apiKey: string }>(`${this.apiUrl}/admin/tenants/${tenantId}/regenerate-api-key`, {});
  }

  /**
   * Get tenant dropdown list (id and name only)
   */
  getTenantDropdown(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.apiUrl}/admin/tenants/dropdown`);
  }
}
