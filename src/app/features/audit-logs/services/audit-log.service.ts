import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuditEvent {
  id: string;
  event_id: string;
  tenant_id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_type: string;
  action_type: string;
  tier: string;
  resource_type: string | null;
  resource_id: string | null;
  source_service: string;
  trace_id: string | null;
  span_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  before_state: any | null;
  after_state: any | null;
  event_metadata: any | null;
  occurred_at: string;
  created_at: string;
}

export interface AuditEventListResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  size: number;
}

export interface AuditStatsResponse {
  total_events: number;
  by_tier: { [key: string]: number };
  by_service: { [key: string]: number };
  by_action_type: { [key: string]: number };
}

export interface AuditFilters {
  page?: number;
  size?: number;
  tenant_id?: string;
  actor_user_id?: string;
  action_type?: string;
  tier?: string;
  resource_type?: string;
  source_service?: string;
  trace_id?: string;
  date_from?: string;
  date_to?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEvents(filters: AuditFilters = {}): Observable<AuditEventListResponse> {
    let params = new HttpParams()
      .set('page', (filters.page || 0).toString())
      .set('size', (filters.size || 20).toString());

    if (filters.tenant_id) params = params.set('tenant_id', filters.tenant_id);
    if (filters.actor_user_id) params = params.set('actor_user_id', filters.actor_user_id);
    if (filters.action_type) params = params.set('action_type', filters.action_type);
    if (filters.tier) params = params.set('tier', filters.tier);
    if (filters.resource_type) params = params.set('resource_type', filters.resource_type);
    if (filters.source_service) params = params.set('source_service', filters.source_service);
    if (filters.trace_id) params = params.set('trace_id', filters.trace_id);
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);

    return this.http.get<AuditEventListResponse>(
      `${this.apiUrl}/audit/events`,
      { params }
    );
  }

  getEvent(eventId: string): Observable<AuditEvent> {
    return this.http.get<AuditEvent>(
      `${this.apiUrl}/audit/events/${eventId}`
    );
  }

  exportEvents(filters: AuditFilters, format: 'csv' | 'json'): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filters.tenant_id) params = params.set('tenant_id', filters.tenant_id);
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);

    return this.http.get(
      `${this.apiUrl}/audit/events/export`,
      { params, responseType: 'blob' }
    );
  }

  getStats(tenantId?: string): Observable<AuditStatsResponse> {
    let params = new HttpParams();
    if (tenantId) params = params.set('tenant_id', tenantId);

    return this.http.get<AuditStatsResponse>(
      `${this.apiUrl}/audit/stats`,
      { params }
    );
  }
}
