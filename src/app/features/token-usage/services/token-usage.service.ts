import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface TokenUsageSummary {
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

export interface TenantTokenUsage {
  tenant_id: string;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

export interface DailyTokenUsage {
  date: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  request_count: number;
}

export interface ModelTokenUsage {
  model: string;
  usage_type: string;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenUsageService {
  private chatUrl = `${environment.apiUrl}/chat/admin/token-usage`;
  private onboardingUrl = `${environment.apiUrl}/admin/token-usage`;

  constructor(private http: HttpClient) {}

  private buildParams(options?: { tenant_id?: string; start_date?: string; end_date?: string; page?: number; size?: number }): HttpParams {
    let params = new HttpParams();
    if (options?.tenant_id) params = params.set('tenant_id', options.tenant_id);
    if (options?.start_date) params = params.set('start_date', options.start_date);
    if (options?.end_date) params = params.set('end_date', options.end_date);
    if (options?.page !== undefined) params = params.set('page', options.page.toString());
    if (options?.size !== undefined) params = params.set('size', options.size.toString());
    return params;
  }

  getSummary(options?: { tenant_id?: string; start_date?: string; end_date?: string }): Observable<TokenUsageSummary> {
    const params = this.buildParams(options);
    return forkJoin([
      this.http.get<any>(`${this.chatUrl}/summary`, { params }).pipe(catchError(() => of(null))),
      this.http.get<any>(`${this.onboardingUrl}/summary`, { params }).pipe(catchError(() => of(null)))
    ]).pipe(
      map(([chat, onboarding]) => this.mergeSummaries(chat, onboarding))
    );
  }

  getByTenant(options?: { start_date?: string; end_date?: string; page?: number; size?: number }): Observable<{ items: TenantTokenUsage[]; total: number }> {
    const params = this.buildParams(options);
    return forkJoin([
      this.http.get<any>(`${this.chatUrl}/by-tenant`, { params }).pipe(catchError(() => of({ items: [] }))),
      this.http.get<any>(`${this.onboardingUrl}/by-tenant`, { params }).pipe(catchError(() => of({ items: [] })))
    ]).pipe(
      map(([chat, onboarding]) => this.mergeTenantData(chat?.items || [], onboarding?.items || []))
    );
  }

  getDailyTrend(options?: { tenant_id?: string; start_date?: string; end_date?: string }): Observable<DailyTokenUsage[]> {
    const params = this.buildParams(options);
    return forkJoin([
      this.http.get<any>(`${this.chatUrl}/daily`, { params }).pipe(catchError(() => of({ items: [] }))),
      this.http.get<any>(`${this.onboardingUrl}/daily`, { params }).pipe(catchError(() => of({ items: [] })))
    ]).pipe(
      map(([chat, onboarding]) => this.mergeDailyData(chat?.items || [], onboarding?.items || []))
    );
  }

  getByModel(options?: { tenant_id?: string; start_date?: string; end_date?: string }): Observable<ModelTokenUsage[]> {
    const params = this.buildParams(options);
    return forkJoin([
      this.http.get<any>(`${this.chatUrl}/by-model`, { params }).pipe(catchError(() => of({ items: [] }))),
      this.http.get<any>(`${this.onboardingUrl}/by-model`, { params }).pipe(catchError(() => of({ items: [] })))
    ]).pipe(
      map(([chat, onboarding]) => [...(chat?.items || []), ...(onboarding?.items || [])])
    );
  }

  private mergeSummaries(chat: any, onboarding: any): TokenUsageSummary {
    return {
      total_prompt_tokens: (chat?.total_prompt_tokens || 0) + (onboarding?.total_prompt_tokens || 0),
      total_completion_tokens: (chat?.total_completion_tokens || 0) + (onboarding?.total_completion_tokens || 0),
      total_tokens: (chat?.total_tokens || 0) + (onboarding?.total_tokens || 0),
      total_cost_usd: (chat?.total_cost_usd || 0) + (onboarding?.total_cost_usd || 0),
      request_count: (chat?.request_count || 0) + (onboarding?.request_count || 0),
    };
  }

  private mergeTenantData(chatItems: TenantTokenUsage[], onbItems: TenantTokenUsage[]): { items: TenantTokenUsage[]; total: number } {
    const map = new Map<string, TenantTokenUsage>();
    for (const item of [...chatItems, ...onbItems]) {
      const existing = map.get(item.tenant_id);
      if (existing) {
        existing.total_prompt_tokens += item.total_prompt_tokens;
        existing.total_completion_tokens += item.total_completion_tokens;
        existing.total_tokens += item.total_tokens;
        existing.total_cost_usd += item.total_cost_usd;
        existing.request_count += item.request_count;
      } else {
        map.set(item.tenant_id, { ...item });
      }
    }
    const items = Array.from(map.values()).sort((a, b) => b.total_cost_usd - a.total_cost_usd);
    return { items, total: items.length };
  }

  private mergeDailyData(chatItems: DailyTokenUsage[], onbItems: DailyTokenUsage[]): DailyTokenUsage[] {
    const map = new Map<string, DailyTokenUsage>();
    for (const item of [...chatItems, ...onbItems]) {
      const existing = map.get(item.date);
      if (existing) {
        existing.prompt_tokens += item.prompt_tokens;
        existing.completion_tokens += item.completion_tokens;
        existing.total_tokens += item.total_tokens;
        existing.cost_usd += item.cost_usd;
        existing.request_count += item.request_count;
      } else {
        map.set(item.date, { ...item });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
