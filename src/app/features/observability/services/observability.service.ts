import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ObservabilityBackend {
  id: string;
  tenant_id: string;
  backend_type: string;
  url: string | null;
  auth_type: string;
  verify_ssl: boolean;
  timeout_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateBackendRequest {
  tenant_id: string;
  backend_type: string;
  url: string;
  auth_type: string;
  credentials?: Record<string, any>;
  verify_ssl?: boolean;
  timeout_seconds?: number;
}

export interface UpdateBackendRequest {
  url?: string;
  auth_type?: string;
  credentials?: Record<string, any>;
  verify_ssl?: boolean;
  timeout_seconds?: number;
  is_active?: boolean;
}

export interface BackendTestResult {
  backend_type: string;
  url: string | null;
  reachable: boolean;
  response_time_ms?: number;
  error?: string;
  details?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class ObservabilityService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Backend CRUD ──

  getBackends(tenantId?: string): Observable<ObservabilityBackend[]> {
    let params: { [key: string]: string } = {};
    if (tenantId) {
      params['tenant_id'] = tenantId;
    }
    return this.http.get<ObservabilityBackend[]>(
      `${this.baseUrl}/admin/observability`, { params }
    );
  }

  createBackend(data: CreateBackendRequest): Observable<ObservabilityBackend> {
    return this.http.post<ObservabilityBackend>(
      `${this.baseUrl}/admin/observability`, data
    );
  }

  updateBackend(
    tenantId: string, backendType: string, data: UpdateBackendRequest
  ): Observable<ObservabilityBackend> {
    return this.http.put<ObservabilityBackend>(
      `${this.baseUrl}/admin/observability/${tenantId}/${backendType}`, data
    );
  }

  deleteBackend(tenantId: string, backendType: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/observability/${tenantId}/${backendType}`
    );
  }

  testBackend(tenantId: string, backendType: string): Observable<BackendTestResult> {
    return this.http.post<BackendTestResult>(
      `${this.baseUrl}/admin/observability/${tenantId}/${backendType}/test`, {}
    );
  }
}
