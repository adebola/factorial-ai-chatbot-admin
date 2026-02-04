import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QualityMetrics {
  platform_average_score: number;
  total_conversations: number;
  high_quality_count: number;
  low_quality_count: number;
  knowledge_gaps_count: number;
  trending_up: boolean;
}

export interface TenantQuality {
  tenant_id: string;
  tenant_name: string;
  average_score: number;
  conversation_count: number;
  high_quality_percentage: number;
  low_quality_percentage: number;
  knowledge_gaps: number;
  trend: 'up' | 'down' | 'stable';
}

export interface QualityTrend {
  date: string;
  average_score: number;
  conversation_count: number;
}

export interface KnowledgeGap {
  id: string;
  tenant_id: string;
  tenant_name: string;
  topic: string;
  frequency: number;
  example_question: string;
  identified_at: string;
}

export interface LowQualityMessage {
  id: string;
  session_id: string;
  tenant_id: string;
  tenant_name: string;
  message_content: string;
  quality_score: number;
  issues: string[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class QualityService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPlatformQualityMetrics(): Observable<QualityMetrics> {
    return this.http.get<QualityMetrics>(`${this.apiUrl}/admin/quality/metrics`);
  }

  getTenantQualityList(params?: { sortBy?: string; sortOrder?: string }): Observable<TenantQuality[]> {
    let httpParams = new HttpParams();
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<TenantQuality[]>(
      `${this.apiUrl}/admin/quality/tenants`,
      { params: httpParams }
    );
  }

  getTenantQualityDetail(tenantId: string): Observable<TenantQuality> {
    return this.http.get<TenantQuality>(`${this.apiUrl}/admin/quality/tenants/${tenantId}`);
  }

  getQualityTrends(days: number = 30): Observable<QualityTrend[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<QualityTrend[]>(`${this.apiUrl}/admin/quality/trends`, { params });
  }

  getKnowledgeGaps(tenantId?: string): Observable<KnowledgeGap[]> {
    let params = new HttpParams();
    if (tenantId) params = params.set('tenantId', tenantId);
    
    return this.http.get<KnowledgeGap[]>(`${this.apiUrl}/admin/quality/knowledge-gaps`, { params });
  }

  getLowQualityMessages(tenantId?: string, limit: number = 20): Observable<LowQualityMessage[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (tenantId) params = params.set('tenantId', tenantId);

    return this.http.get<LowQualityMessage[]>(
      `${this.apiUrl}/admin/quality/low-quality-messages`,
      { params }
    );
  }
}
