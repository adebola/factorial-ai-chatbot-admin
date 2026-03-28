import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AgenticService {
  id: string;
  name: string;
  service_key: string;
  description: string | null;
  base_url: string | null;
  health_check_url: string | null;
  category: string;
  is_active: boolean;
  tenant_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface CreateServiceRequest {
  name: string;
  service_key: string;
  description?: string;
  base_url?: string;
  health_check_url?: string;
  category: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  base_url?: string;
  health_check_url?: string;
  category?: string;
  is_active?: boolean;
}

export interface TenantAssignment {
  id: string;
  tenant_id: string;
  service_id: string;
  assigned_by: string;
  assigned_by_email: string | null;
  config: Record<string, any> | null;
  notes: string | null;
  is_active: boolean;
  deactivated_at: string | null;
  deactivated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AssignRequest {
  tenant_id: string;
  config?: Record<string, any>;
  notes?: string;
}

export interface HealthCheckResult {
  status: string;
  status_code?: number;
  latency_ms?: number;
  url: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgenticServiceService {
  private billingUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Service Catalog ──

  getServices(includeInactive: boolean = false): Observable<AgenticService[]> {
    let params: { [key: string]: string } = {};
    if (includeInactive) {
      params['include_inactive'] = 'true';
    }
    return this.http.get<AgenticService[]>(`${this.billingUrl}/admin/services`, { params });
  }

  getServiceById(id: string): Observable<AgenticService> {
    return this.http.get<AgenticService>(`${this.billingUrl}/admin/services/${id}`);
  }

  createService(data: CreateServiceRequest): Observable<AgenticService> {
    return this.http.post<AgenticService>(`${this.billingUrl}/admin/services`, data);
  }

  updateService(id: string, data: UpdateServiceRequest): Observable<AgenticService> {
    return this.http.put<AgenticService>(`${this.billingUrl}/admin/services/${id}`, data);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.billingUrl}/admin/services/${id}`);
  }

  healthCheck(healthCheckUrl: string): Observable<HealthCheckResult> {
    return this.http.get<HealthCheckResult>(healthCheckUrl);
  }

  // ── Tenant Assignments ──

  getAssignedTenants(serviceId: string, includeInactive: boolean = false): Observable<TenantAssignment[]> {
    let params: { [key: string]: string } = {};
    if (includeInactive) {
      params['include_inactive'] = 'true';
    }
    return this.http.get<TenantAssignment[]>(
      `${this.billingUrl}/admin/services/${serviceId}/tenants`, { params }
    );
  }

  getTenantServices(tenantId: string): Observable<AgenticService[]> {
    return this.http.get<AgenticService[]>(`${this.billingUrl}/admin/tenants/${tenantId}/services`);
  }

  assignService(serviceId: string, request: AssignRequest): Observable<TenantAssignment> {
    return this.http.post<TenantAssignment>(
      `${this.billingUrl}/admin/services/${serviceId}/assign`, request
    );
  }

  revokeService(serviceId: string, tenantId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.billingUrl}/admin/services/${serviceId}/assign/${tenantId}`
    );
  }

  updateAssignment(
    serviceId: string, tenantId: string, data: { config?: Record<string, any>; notes?: string; is_active?: boolean }
  ): Observable<TenantAssignment> {
    return this.http.put<TenantAssignment>(
      `${this.billingUrl}/admin/services/${serviceId}/assign/${tenantId}`, data
    );
  }
}
