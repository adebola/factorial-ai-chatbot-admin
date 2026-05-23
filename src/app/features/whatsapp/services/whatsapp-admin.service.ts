import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WhatsAppConfig {
  tenant_id: string;
  whatsapp_enabled: boolean;
  phone_number: string | null;
  account_sid_masked: string | null;
}

export interface WhatsAppMessage {
  id: string;
  tenant_id: string;
  direction: 'inbound' | 'outbound';
  wa_id: string | null;
  to_phone: string;
  from_phone: string;
  message: string;
  status: string;
  provider_message_id: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string | null;
}

export interface WhatsAppListResponse {
  messages: WhatsAppMessage[];
  total: number;
  page: number;
  size: number;
}

export interface WhatsAppMessageFilters {
  page?: number;
  size?: number;
  status_filter?: string;
  direction?: 'inbound' | 'outbound';
}

@Injectable({
  providedIn: 'root',
})
export class WhatsAppAdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConfigForTenant(tenantId: string): Observable<WhatsAppConfig> {
    return this.http.get<WhatsAppConfig>(`${this.apiUrl}/whatsapp/admin/config/${tenantId}`);
  }

  listMessagesForTenant(
    tenantId: string,
    filters: WhatsAppMessageFilters = {}
  ): Observable<WhatsAppListResponse> {
    let params = new HttpParams();
    if (filters.page !== undefined) params = params.set('page', String(filters.page));
    if (filters.size !== undefined) params = params.set('size', String(filters.size));
    if (filters.status_filter) params = params.set('status_filter', filters.status_filter);
    if (filters.direction) params = params.set('direction', filters.direction);
    return this.http.get<WhatsAppListResponse>(
      `${this.apiUrl}/whatsapp/admin/messages/${tenantId}`,
      { params }
    );
  }
}
