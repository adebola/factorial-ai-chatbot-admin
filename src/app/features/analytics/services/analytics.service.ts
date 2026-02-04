import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SystemMetrics {
  total_revenue: number;
  mrr: number;
  arr: number;
  active_subscriptions: number;
  churn_rate: number;
  average_revenue_per_tenant: number;
}

export interface EngagementMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  messages_per_user: number;
  active_conversations: number;
}

export interface GrowthMetrics {
  new_tenants_this_month: number;
  new_users_this_month: number;
  growth_rate: number;
  conversion_rate: number;
  retention_rate: number;
}

export interface SystemHealth {
  api_uptime: number;
  average_response_time: number;
  error_rate: number;
  database_health: string;
  cache_hit_rate: number;
  queue_status: string;
}

export interface PerformanceMetric {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  requests_per_second: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  subscriptions: number;
}

export interface UserGrowthDataPoint {
  date: string;
  new_users: number;
  total_users: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSystemMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>(`${this.apiUrl}/admin/analytics/system-metrics`);
  }

  getEngagementMetrics(): Observable<EngagementMetrics> {
    return this.http.get<EngagementMetrics>(`${this.apiUrl}/admin/analytics/engagement`);
  }

  getGrowthMetrics(): Observable<GrowthMetrics> {
    return this.http.get<GrowthMetrics>(`${this.apiUrl}/admin/analytics/growth`);
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.apiUrl}/admin/analytics/health`);
  }

  getRevenueTrend(days: number): Observable<RevenueDataPoint[]> {
    return this.http.get<RevenueDataPoint[]>(`${this.apiUrl}/admin/analytics/revenue-trend?days=${days}`);
  }

  getUserGrowthTrend(days: number): Observable<UserGrowthDataPoint[]> {
    return this.http.get<UserGrowthDataPoint[]>(`${this.apiUrl}/admin/analytics/user-growth?days=${days}`);
  }

  getPerformanceMetrics(hours: number): Observable<PerformanceMetric[]> {
    return this.http.get<PerformanceMetric[]>(`${this.apiUrl}/admin/analytics/performance?hours=${hours}`);
  }
}
