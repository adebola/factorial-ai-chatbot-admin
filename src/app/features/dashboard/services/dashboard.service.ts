import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardMetrics {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  active_users: number;
  total_chats: number;
  total_messages: number;
  total_revenue: number;
  monthly_revenue: number;
}

export interface GrowthData {
  labels: string[];
  tenant_growth: number[];
  revenue_growth: number[];
  chat_volume: number[];
}

export interface RecentActivity {
  id: string;
  type: 'tenant' | 'payment' | 'user' | 'chat';
  description: string;
  timestamp: string;
  tenant_name?: string;
}

export interface QuickStats {
  new_tenants_today: number;
  new_users_today: number;
  revenue_today: number;
  chats_today: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get platform-wide dashboard metrics
   */
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/admin/dashboard/metrics`);
  }

  /**
   * Get growth data for charts
   */
  getGrowthData(days: number = 30): Observable<GrowthData> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<GrowthData>(`${this.apiUrl}/admin/dashboard/growth`, { params });
  }

  /**
   * Get recent platform activity
   */
  getRecentActivity(limit: number = 10): Observable<RecentActivity[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/admin/dashboard/activity`, { params });
  }

  /**
   * Get quick stats (today's activity)
   */
  getQuickStats(): Observable<QuickStats> {
    return this.http.get<QuickStats>(`${this.apiUrl}/admin/dashboard/quick-stats`);
  }
}
