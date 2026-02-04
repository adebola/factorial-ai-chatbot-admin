import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface ChatSession {
  id: string;
  tenant_id: string;
  tenant_name: string;
  user_id: string;
  user_email: string;
  status: 'active' | 'completed' | 'abandoned';
  message_count: number;
  quality_score?: number;
  started_at: string;
  ended_at?: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface ChatSessionListParams {
  page?: number;
  size?: number;
  tenantId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minQuality?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatMonitoringService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getChatSessions(params: ChatSessionListParams = {}): Observable<ApiResponse<ChatSession[]>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 20).toString());

    if (params.tenantId) httpParams = httpParams.set('tenantId', params.tenantId);
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.minQuality) httpParams = httpParams.set('minQuality', params.minQuality.toString());

    return this.http.get<ApiResponse<ChatSession[]>>(
      `${this.apiUrl}/admin/chat-monitoring/sessions`,
      { params: httpParams }
    );
  }

  getChatSessionById(sessionId: string): Observable<ChatSession> {
    return this.http.get<ChatSession>(
      `${this.apiUrl}/admin/chat-monitoring/sessions/${sessionId}`
    );
  }

  getChatMessages(sessionId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/admin/chat-monitoring/sessions/${sessionId}/messages`
    );
  }

  exportChatSession(sessionId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/admin/chat-monitoring/sessions/${sessionId}/export`,
      { responseType: 'blob' }
    );
  }
}
